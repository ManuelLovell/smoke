import OBR from '@owlbear-rodeo/sdk';

export const SMOKE_METRICS_CHANNEL = 'SMOKE/metrics';

export type SMOKEMetricEvent = {
    eventId?: string;
    eventName: string;
    eventCategory?: string;
    playerId?: string | null;
    success?: boolean;
    durationMs?: number;
    errorCode?: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
};

export async function TrackSMOKEEvent(event: SMOKEMetricEvent): Promise<void>
{
    await OBR.broadcast.sendMessage(SMOKE_METRICS_CHANNEL, event, { destination: 'LOCAL' });
}

export async function TrackSMOKEEventImmediately(event: SMOKEMetricEvent): Promise<void>
{
    await TrackSMOKEEvent(event);
}
