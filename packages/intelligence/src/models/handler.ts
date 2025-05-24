import { addToSnapshot } from './add-to-snapshot';
import { invokeLLM } from './invoke';
import { parseLLMOutput } from './parser/parser';
import type { InvokeModelParams } from './types';

export async function invokeModelAgainstThread(params: InvokeModelParams) {
    params.log.log('Sending to model to invoke');
    const modelResponse = await invokeLLM(params);
    params.log.log('Sending to parser to build structured output');
    const parsedData = await parseLLMOutput(modelResponse.outputString);
    params.log.log('Parser completed, structured output:', { parsedData });
    await addToSnapshot(modelResponse.snapshot, parsedData);
    return { ...modelResponse, parsed: parsedData };
}
