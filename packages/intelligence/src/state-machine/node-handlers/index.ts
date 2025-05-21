import { NodeHandler } from '../node-handler';
import { HelloWorldNode } from './helloWorldNode';

export { NodeHandler };

export const Nodes = {
    HelloWorld: new HelloWorldNode(),
};
