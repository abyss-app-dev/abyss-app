import { NodeHandler } from '../node-handler';
import { AddAgentMessageToThreadNode } from './addAgentMessageToThread';
import { AddHumanMessageToThreadNode } from './addHumanMessageToThread';
import { AddSystemMessageToThreadNode } from './addSystemMessageToThread';
import { ConstDocumentsetNode } from './constDocumentset';
import { ConstModelNode } from './constModel';
import { ConstStringNode } from './constString';
import { ConstToolsetNode } from './constToolset';
import { HelloWorldNode } from './helloWorldNode';
import { InvokeModelAgainstThreadNode } from './invokeModelAgainstThread';
import { OnThreadMessageNode } from './onThreadMessage';
import { SetContextDocumentsInThreadNode } from './setContextDocumentsInThread';
import { SetToolsInThreadNode } from './setToolsInThread';
export { NodeHandler };

export const Nodes = {
    HelloWorld: new HelloWorldNode(),
    ConstString: new ConstStringNode(),
    ConstModel: new ConstModelNode(),
    ConstToolset: new ConstToolsetNode(),
    ConstDocumentset: new ConstDocumentsetNode(),
    OnThreadMessage: new OnThreadMessageNode(),
    AddSystemMessageToThread: new AddSystemMessageToThreadNode(),
    AddAgentMessageToThread: new AddAgentMessageToThreadNode(),
    AddHumanMessageToThread: new AddHumanMessageToThreadNode(),
    InvokeModelAgainstThread: new InvokeModelAgainstThreadNode(),
    SetToolsInThread: new SetToolsInThreadNode(),
    SetContextDocumentsInThread: new SetContextDocumentsInThreadNode(),
};
