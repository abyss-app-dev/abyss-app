import { ToolHandler } from '../tool-handler';
import type { ToolHandlerExecutionParams } from '../types';

interface Parameters {
    label: string;
}

export class LabelThreadToolHandler extends ToolHandler {
    protected async _execute(params: Parameters, ctx: ToolHandlerExecutionParams) {
        await ctx.thread.setName(params.label);
        return {
            raw: `Thread labeled as ${params.label}`,
        };
    }
}
