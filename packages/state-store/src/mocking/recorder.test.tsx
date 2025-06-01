import { render } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { StateRecorder } from './state-recorder';
import { TestRecorder } from './wrapped-component';

describe('recorder', () => {
    test('demonstrates the testing pattern using recorder', async () => {
        const recorder = new StateRecorder();
        render(<TestRecorder recorder={recorder} functionToTest={() => 1} />);
        expect(recorder.getStates()).matchSnapshot();
    });

    test('demonstrates the testing pattern using recorder with state updates', async () => {
        const recorder = new StateRecorder();

        const test = () => {
            const [state, setState] = useState(0);

            useEffect(() => {
                if (state < 3) {
                    setState(state + 1);
                }
            }, [state]);

            return state;
        };

        render(<TestRecorder recorder={recorder} functionToTest={test} />);
        expect(recorder.getStates()).matchSnapshot();
    });
});
