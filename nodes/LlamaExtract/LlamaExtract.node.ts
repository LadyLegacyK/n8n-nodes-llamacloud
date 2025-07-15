import {
    IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
    NodeConnectionType,
} from 'n8n-workflow';

import {
    extractDataFromFile,
} from "./utils";

export class LlamaExtract implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LlamaExtract',
        name: 'LlamaExtract',
        icon: 'file:llamacloud.svg',
        group: ['transform'],
        version: 1,
        description: 'Extract content from files through LlamaExtract agents!',
        defaults: {
            name: 'LlamaExtract',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: "LlamaCloudApi",
                required: true,
            }
        ],
		properties: [
			{
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Extract Data',
                        value: 'extracting',
                    },
                ],
                default: 'extracting',
                noDataExpression: true,
                required: true,
                description: 'Extract Data From a File and Get Elegant Structured Information about it.',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: [
                            'extracting',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Extract',
                        value: 'extract',
                        description: 'Extract Data from a File',
                        action: 'Extract Data from a File',
                    },
                ],
                default: 'extract',
                noDataExpression: true,
            },
             {
                displayName: 'Agent Id',
                name: 'agentId',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'extract',
                        ],
                        resource: [
                            'extracting',
                        ],
                    },
                },
                default:'',
                placeholder: '',
                description:'Extraction Agent Id',
            },
            {
                displayName: 'File Path',
                name: 'filePath',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'extract',
                        ],
                        resource: [
                            'extracting',
                        ],
                    },
                },
                default:'',
                placeholder: '/User/user/Desktop/file.pdf',
                description:'Path to your file',
            },
        ],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        
        // For each item, make an API call to create a contact
        for (let i = 0; i < items.length; i++) {
            if (resource === 'extracting') {
                if (operation === 'extract') {
                    // Get email input
                    const filePath = this.getNodeParameter('filePath', i) as string;
                    // Get additional fields input
                    const credentials = await this.getCredentials("LlamaCloudApi");
                    const apiKey = credentials.apiKey as string;
                    
                    const agentId = this.getNodeParameter('agentId', i) as string;
                    
                    const result = await extractDataFromFile(apiKey, agentId, filePath)
                    
                    returnData.push(result)  
                }
            }
        }
        // Map data to n8n data structure
        return [this.helpers.returnJsonArray(returnData)];
	}
}