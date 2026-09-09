import OBR from '@owlbear-rodeo/sdk';
import { MetricsConfig } from '../helpers/BSConstants';
import { supabase } from '../supabase/supabaseClient';
import { SMOKE_METRICS_CHANNEL, type SMOKEMetricEvent } from './SmokeMetrics';

type Environment = 'dev' | 'staging' | 'prod';

type SMOKEMetricRecord = {
    event_id: string;
    occurred_at: string;
    source_app: 'SMOKE';
    source_version: string;
    environment: Environment;
    session_id: string;
    event_name: string;
    event_category: string;
    actor_id_hash: string | null;
    player_id: string | null;
    success: boolean | null;
    duration_ms: number | null;
    error_code: string | null;
    error_message: string | null;
    metadata: Record<string, unknown>;
};

const METRICS_EVENTS_TABLE = 'bs_metrics_events';
const SESSION_ID = createId();

let metricsQueue: SMOKEMetricRecord[] = [];
let flushTimerId: number | null = null;
let metricsInitialized = false;
let flushInProgress = false;
let metricsDisabled = false;
const actorHashCache = new Map<string, string>();
const seenEventIds = new Set<string>();

function createId(): string
{
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    {
        return crypto.randomUUID();
    }

    return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveEnvironment(): Environment
{
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'dev';
    if (host.includes('staging')) return 'staging';
    return 'prod';
}

function fallbackHash(input: string): string
{
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++)
    {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

async function hashActorId(playerId: string): Promise<string>
{
    const cached = actorHashCache.get(playerId);
    if (cached) return cached;

    let hashed = '';
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined')
    {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(playerId));
        const digestArray = Array.from(new Uint8Array(digest));
        hashed = digestArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }
    else
    {
        hashed = fallbackHash(playerId);
    }

    actorHashCache.set(playerId, hashed);
    return hashed;
}

function initializeMetricsTransport()
{
    if (metricsInitialized) return;
    metricsInitialized = true;

    flushTimerId = window.setInterval(() => {
        void flushMetricsQueue('interval');
    }, MetricsConfig.METRICS_FLUSH_MS);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') void flushMetricsQueue('hidden');
    });

    window.addEventListener('beforeunload', () => {
        void flushMetricsQueue('unload');
    });
}

async function flushMetricsQueue(reason: 'interval' | 'hidden' | 'unload' | 'batch-size')
{
    if (metricsDisabled)
    {
        metricsQueue = [];
        return;
    }

    if (flushInProgress || metricsQueue.length === 0) return;
    flushInProgress = true;

    try
    {
        while (metricsQueue.length > 0)
        {
            const chunk = metricsQueue.slice(0, MetricsConfig.METRICS_BATCH_SIZE);
            const { error } = await supabase
                .from(METRICS_EVENTS_TABLE)
                .insert(chunk);

            if (error)
            {
                const statusCode = typeof (error as any).code === 'string' && (error as any).code.includes('401') ? 401 : null;
                if (statusCode === 401)
                {
                    metricsDisabled = true;
                    metricsQueue = [];
                    console.warn('SMOKE metrics disabled after authorization failure.');
                }
                else
                {
                    console.error('SMOKE metrics batch insert failed:', error);
                }
                break;
            }

            metricsQueue = metricsQueue.slice(chunk.length);
            if (reason === 'batch-size' && flushTimerId)
            {
                window.clearTimeout(flushTimerId);
            }
        }
    }
    finally
    {
        flushInProgress = false;
    }
}

async function enqueueMetric(event: SMOKEMetricEvent): Promise<void>
{
    if (!MetricsConfig.USE_APP_METRICS || metricsDisabled) return;

    const eventId = event.eventId ?? createId();
    if (seenEventIds.has(eventId)) {
        return;
    }
    seenEventIds.add(eventId);

    initializeMetricsTransport();

    const actorIdHash = event.playerId ? await hashActorId(event.playerId) : null;

    metricsQueue.push({
        event_id: eventId,
        occurred_at: new Date().toISOString(),
        source_app: 'SMOKE',
        source_version: __APP_VERSION__,
        environment: resolveEnvironment(),
        session_id: SESSION_ID,
        event_name: event.eventName,
        event_category: event.eventCategory ?? 'app',
        actor_id_hash: actorIdHash,
        player_id: event.playerId ?? null,
        success: event.success ?? null,
        duration_ms: typeof event.durationMs === 'number' ? event.durationMs : null,
        error_code: event.errorCode ?? null,
        error_message: event.errorMessage ?? null,
        metadata: event.metadata ?? {},
    });

    if (metricsQueue.length >= MetricsConfig.METRICS_BATCH_SIZE)
    {
        void flushMetricsQueue('batch-size');
    }
}

export function initializeSMOKEMetricsQueue(): () => void
{
    initializeMetricsTransport();

    const unsubscribe = OBR.broadcast.onMessage(SMOKE_METRICS_CHANNEL, (event) => {
        const data = event.data as SMOKEMetricEvent;
        if (!data || typeof data !== 'object') {
            return;
        }

        void enqueueMetric(data);
    });

    return () => {
        unsubscribe();
        void flushMetricsQueue('unload');
    };
}