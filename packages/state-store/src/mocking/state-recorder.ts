import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect } from 'vitest';
import { wait } from './wait';

export class StateRecorder {
    private states: unknown[] = [];

    record(state: unknown): void {
        this.states.push(state);
    }

    async delayedResolve(): Promise<unknown[]> {
        await wait();
        return this.states;
    }

    getStates(): unknown[] {
        return this.states;
    }

    getLatestState(): unknown {
        return this.states[this.states.length - 1];
    }

    clear(): void {
        this.states.length = 0;
    }

    async renderToSnapshot(component: ReactNode): Promise<void> {
        render(component);
        expect(await this.delayedResolve()).toMatchSnapshot();
    }
}
