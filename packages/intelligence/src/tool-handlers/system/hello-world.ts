import { ToolHandler } from '../tool-handler';
import type { ToolHandlerExecutionParams } from '../types';

interface Parameters {
    input: string;
}

export class HelloWorldToolHandler extends ToolHandler {
    protected async _execute(params: Parameters, ctx: ToolHandlerExecutionParams) {
        ctx.log.log(`Hello ${params.input}`);
        return {
            raw: params.input,
        };
    }
}
