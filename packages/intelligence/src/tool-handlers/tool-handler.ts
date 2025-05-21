import type { ToolDefinitionType } from '@abyss/records';
import type { ToolHandlerExecutionParams, ToolHandlerExecutionResult } from './types';

export abstract class ToolHandler {
    private readonly toolDefinition: ToolDefinitionType;

    constructor(toolDefinition: ToolDefinitionType) {
        this.toolDefinition = toolDefinition;
    }

    async execute(params: ToolHandlerExecutionParams) {
        const dimensions = {
            toolDefintion: this.toolDefinition.name,
        };
        return await params.thread.client.tables.metric.wrapSqliteMetric(
            'tool-handler',
            dimensions,
            async () => await this.handleExecute(params)
        );
    }

    private async handleExecute(params: ToolHandlerExecutionParams) {
        params.log.log(`Executing tool handler: ${this.toolDefinition.name}`);
        return await this._execute(params.request.parameters, params);
    }

    protected abstract _execute(props: unknown, params: ToolHandlerExecutionParams): Promise<ToolHandlerExecutionResult>;
}
