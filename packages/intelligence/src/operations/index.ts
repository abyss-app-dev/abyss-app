import { invokeGraphFromUserMessage } from './invoke-graph-fom-user-message/handler';
import { invokeModelHandler } from './invoke-model/handler';

export const Operations = {
    invokeGraphFromUserMessage,
    invokeModel: invokeModelHandler,
};
