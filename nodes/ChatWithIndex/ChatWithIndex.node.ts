import {
    IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
    NodeConnectionType,
} from 'n8n-workflow';

import {
    LlamaCloudIndex,
    MetadataMode
} from "llamaindex"


export class ChatWithIndex implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LlamaCloud Chat',
        name: 'LlamaCloud',
        icon: 'file:llamacloud.svg',
        group: ['action'],
        version: 1,
        description: 'Chat with your LlamaCloud Index',
        defaults: {
            name: 'LlamaCloud Index',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: "LlamaCloudApi",
                required: false,
            }
        ],
		properties: [
            {
                displayName: 'API key',
                name: 'apiKey',
                type: 'string',
                required: true,
                default:'',
                placeholder: 'llx-***',
                description:'LlamaCloud API key',
            },
			{
                displayName: 'Index Name',
                name: 'Index name',
                type: 'string',
                required: true,
                default:'',
                placeholder: 'my-index-name',
                description:'Your LlamaCloud index name',
            },
        ],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Get parameters from node
		const apiKey = this.getNodeParameter('apiKey', 0) as string;
		const indexName = this.getNodeParameter('Index name', 0) as string;
		const items = this.getInputData();
		console.log('Input items:', items);
		const chatMessage = typeof items[0].json.chatInput === 'string'
		? items[0].json.chatInput
		: '';
		// // Initialize LlamaCloudIndex
		const index = new LlamaCloudIndex({
			apiKey: apiKey,
			name: indexName,
			projectName: 'Default'
		});

		const retriever = index.asRetriever({
			similarityTopK: 5,
		});

		const contexts = await retriever.retrieve({
			query: chatMessage,
		});

		// Extract the text content from each context item using getContent()
		const contextTexts = Array.isArray(contexts)
			? contexts.map((item) => (item.node && typeof item.node.getContent === 'function') ? item.node.getContent(MetadataMode.NONE) : null).filter(Boolean)
			: [];

		return [[{ json: { context: contextTexts } }]];
	}
}