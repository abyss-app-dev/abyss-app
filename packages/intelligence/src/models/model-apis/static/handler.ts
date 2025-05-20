import type { InvokeModelInternalResult } from '../../types';
import type { StaticLanguageModelOptions } from './types';

export async function InvokeStatic(props: StaticLanguageModelOptions): Promise<InvokeModelInternalResult> {
    return {
        inputStructured: [],
        outputStructured: props.response,
        outputString: props.response,
        metrics: {},
    };
}
