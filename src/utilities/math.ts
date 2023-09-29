import { Vector2 } from "@owlbear-rodeo/sdk"

export function distance(P1: { x: number; y: number; }, P2: { x: number; y: number; })
{
    return Math.sqrt((P1.x - P2.x) * (P1.x - P2.x) + (P1.y - P2.y) * (P1.y - P2.y));
}

export function squareDistance(P1: { x: number; y: number; }, P2: { x: number; y: number; })
{
    return (P1.x - P2.x) * (P1.x - P2.x) + (P1.y - P2.y) * (P1.y - P2.y);
}

export function comparePosition(p1: { x: any; y: any; }, p2: { x: any; y: any; })
{
    return p1.x == p2.x && p1.y == p2.y;
}

export function isClose(x1: number, x2: number, tol?: number)
{
    if (tol === undefined)
        tol = 0.01;
    return Math.abs(x1 - x2) <= tol;
}

export function mod(n: number, m: number)
{
    return ((n % m) + m) % m;
}

// Thanks Mitch!

export type Matrix = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];

/**
* Math class for a 2D transformation Matrix
*/
export class MathM {
    static inverse(matrix: Matrix): Matrix {
        const [m1, m2, m3, m4, m5, m6, m7, m8, m9] = matrix;
        const det =
        m1 * (m5 * m9 - m8 * m6) -
        m2 * (m4 * m9 - m6 * m7) +
        m3 * (m4 * m8 - m5 * m7);

        if (Math.abs(det) < 1e-14) {
            return matrix;
        }

        const invdet = 1 / det;

        const im1 = (m5 * m9 - m8 * m6) * invdet;
        const im2 = (m3 * m8 - m2 * m9) * invdet;
        const im3 = (m2 * m6 - m3 * m5) * invdet;
        const im4 = (m6 * m7 - m4 * m9) * invdet;
        const im5 = (m1 * m9 - m3 * m7) * invdet;
        const im6 = (m4 * m3 - m1 * m6) * invdet;
        const im7 = (m4 * m8 - m7 * m5) * invdet;
        const im8 = (m7 * m2 - m1 * m8) * invdet;
        const im9 = (m1 * m5 - m4 * m2) * invdet;

        return [im1, im2, im3, im4, im5, im6, im7, im8, im9];
    }

    static multiply(a: Matrix, b: Matrix): Matrix {
        return [
            a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
            a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
            a[0] * b[2] + a[1] * b[5] + a[2] * b[8],

            a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
            a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
            a[3] * b[2] + a[4] * b[5] + a[5] * b[8],

            a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
            a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
            a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
        ];
    }

    /**
    * Create a new transformation matrix from a translation
    * @param t - translation
    * @returns
    */
    static translate(t: Vector2): Matrix {
        return [1, 0, t.x, 0, 1, t.y, 0, 0, 1];
    }

    /**
    * Create a new transformation matrix from a rotation
    * @param r - rotation in radians
    */
    static rotate(r: number): Matrix {
        return [Math.cos(r), -Math.sin(r), 0, Math.sin(r), Math.cos(r), 0, 0, 0, 1];
    }

    /**
    * Create a new transformation matrix from a scale
    * @param s - scale
    * @returns
    */
    static scale(s: Vector2): Matrix {
        return [s.x, 0, 0, 0, s.y, 0, 0, 0, 1];
    }

    /**
    * Decompose matrix into its individual parts
    * Adapted from https://frederic-wang.fr/decomposition-of-2d-transform-matrices.html
    */
    static decompose(matrix: Matrix): {
        translation: Vector2;
        scale: Vector2;
        rotation: number;
    } {
        const [m1, m2, m3, m4, m5, m6] = matrix;
        const delta = m1 * m5 - m4 * m2;

        const result = {
            translation: { x: m3, y: m6 },
            rotation: 0,
            scale: { x: 1, y: 1 },
        };

        // Apply the QR-like decomposition.
        if (m1 != 0 || m4 != 0) {
            var r = Math.sqrt(m1 * m1 + m4 * m4);
            result.rotation = m4 > 0 ? Math.acos(m1 / r) : -Math.acos(m1 / r);
            result.scale = { x: r, y: delta / r };
        } else if (m2 != 0 || m5 != 0) {
            var s = Math.sqrt(m2 * m2 + m5 * m5);
            result.rotation =
            Math.PI / 2 - (m5 > 0 ? Math.acos(-m2 / s) : -Math.acos(m2 / s));
            result.scale = { x: delta / s, y: s };
        } else {
            // a = b = c = d = 0
        }

        return result;
    }
}

export function toRadians(angle: number) {
    return angle * (Math.PI / 180);
}
