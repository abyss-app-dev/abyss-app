import type { StateRecorder } from './state-recorder';

export function TestRecorder<T>({ functionToTest, recorder }: { functionToTest: () => T; recorder: StateRecorder }) {
    recorder.record(functionToTest());
    return <>content</>;
}
