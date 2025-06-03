import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

/**
 * MCP Client Configuration Examples
 *
 * This file demonstrates the new MCP connection system with the 4-field transport config:
 * - name: Display name for the transport configuration
 * - type: 'stdio' | 'streamable-http'
 * - configEnvironmentData: Environment variables as key-value pairs
 * - configOptionData: Type-specific configuration options
 */

// Type definitions matching the new structure
type McpConnectionTransportType = 'stdio' | 'streamable-http';

interface McpConnectionTransportConfig {
    name: string;
    type: McpConnectionTransportType;
    configEnvironmentData: Record<string, string>;
    configOptionData: Record<string, unknown>;
}

interface StdioTransportConfig extends McpConnectionTransportConfig {
    type: 'stdio';
    configOptionData: {
        command: string;
        args?: string[];
        workingDirectory?: string;
        timeout?: number;
    };
}

interface StreamableHttpTransportConfig extends McpConnectionTransportConfig {
    type: 'streamable-http';
    configOptionData: {
        url: string;
        headers?: Record<string, string>;
        timeout?: number;
        retryAttempts?: number;
        authentication?: {
            type: 'bearer' | 'api-key' | 'oauth';
            token?: string;
            apiKey?: string;
            clientId?: string;
            clientSecret?: string;
        };
    };
}

// Type guards
function isStdioTransport(config: McpConnectionTransportConfig): config is StdioTransportConfig {
    return config.type === 'stdio';
}

function isStreamableHttpTransport(config: McpConnectionTransportConfig): config is StreamableHttpTransportConfig {
    return config.type === 'streamable-http';
}

// =============================================================================
// EXAMPLE 1: LOCAL STDIO SERVER USING NEW CONFIG STRUCTURE
// =============================================================================

async function connectToLocalStdioServer() {
    console.log('=== LOCAL STDIO SERVER EXAMPLE (New Config Structure) ===');

    // Create STDIO transport config using the new 4-field structure
    const stdioConfig: StdioTransportConfig = {
        name: 'Local File Server',
        type: 'stdio',
        configEnvironmentData: {
            DEBUG: 'mcp*',
            DATA_PATH: '/path/to/data',
            NODE_ENV: 'development',
        },
        configOptionData: {
            command: 'node',
            args: ['./local-mcp-server.js', '--verbose'],
            workingDirectory: '/path/to/server',
            timeout: 30000,
        },
    };

    // Create client
    const client = new Client({
        name: 'example-client',
        version: '1.0.0',
    });

    // Create stdio transport using the config data
    const transport = new StdioClientTransport({
        command: stdioConfig.configOptionData.command,
        args: stdioConfig.configOptionData.args || [],
        env: stdioConfig.configEnvironmentData,
    });

    try {
        console.log('Connecting to:', stdioConfig.name);
        console.log('Command:', stdioConfig.configOptionData.command, stdioConfig.configOptionData.args?.join(' '));
        console.log('Environment:', stdioConfig.configEnvironmentData);

        await client.connect(transport);

        // Test connection by listing available features
        const prompts = await client.listPrompts();
        const resources = await client.listResources();
        const tools = await client.listTools();

        console.log('Connected successfully!');
        console.log(`Available prompts: ${prompts.prompts?.length || 0}`);
        console.log(`Available resources: ${resources.resources?.length || 0}`);
        console.log(`Available tools: ${tools.tools?.length || 0}`);
    } catch (error) {
        console.error('Failed to connect to local server:', error);
    } finally {
        await client.close();
    }
}

// =============================================================================
// EXAMPLE 2: REMOTE STREAMABLE HTTP SERVER USING NEW CONFIG STRUCTURE
// =============================================================================

async function connectToRemoteHTTPServer() {
    console.log('\n=== REMOTE STREAMABLE HTTP SERVER EXAMPLE (New Config Structure) ===');

    // Create Streamable HTTP transport config using the new 4-field structure
    const httpConfig: StreamableHttpTransportConfig = {
        name: 'Remote Weather API Server',
        type: 'streamable-http',
        configEnvironmentData: {
            API_RATE_LIMIT: '1000',
            LOG_LEVEL: 'info',
        },
        configOptionData: {
            url: 'https://api.example.com/mcp',
            headers: {
                'User-Agent': 'MyMCPClient/1.0',
                'X-Client-Version': '1.0.0',
            },
            timeout: 10000,
            retryAttempts: 3,
            authentication: {
                type: 'bearer',
                token: 'your-auth-token-here',
            },
        },
    };

    // Create client
    const client = new Client({
        name: 'example-client',
        version: '1.0.0',
    });

    // Create streamable HTTP transport using the config data
    const transport = new StreamableHTTPClientTransport(new URL(httpConfig.configOptionData.url));

    try {
        console.log('Connecting to:', httpConfig.name);
        console.log('URL:', httpConfig.configOptionData.url);
        console.log('Authentication:', httpConfig.configOptionData.authentication?.type);
        console.log('Environment:', httpConfig.configEnvironmentData);

        await client.connect(transport);

        // Test the connection
        const tools = await client.listTools();
        console.log('Connected to remote server successfully!');
        console.log(`Available tools: ${tools.tools?.length || 0}`);

        // Example: Call a tool if available
        if (tools.tools && tools.tools.length > 0) {
            const firstTool = tools.tools[0];
            console.log(`Example tool available: ${firstTool.name}`);

            try {
                const result = await client.callTool({
                    name: 'get_weather',
                    arguments: {
                        location: 'San Francisco, CA',
                        units: 'celsius',
                    },
                });
                console.log('Tool call result:', result);
            } catch (toolError) {
                console.log('Tool call failed (expected for this example):', toolError);
            }
        }
    } catch (error) {
        console.error('Failed to connect to remote server:', error);
    } finally {
        await client.close();
    }
}

// =============================================================================
// EXAMPLE 3: TYPE-SAFE CONFIG CASTING AND VALIDATION
// =============================================================================

async function demonstrateTypeSafeCasting() {
    console.log('\n=== TYPE-SAFE CONFIG CASTING EXAMPLE ===');

    // Example of working with configs in a type-safe way
    const configs: McpConnectionTransportConfig[] = [
        {
            name: 'Local Python Server',
            type: 'stdio',
            configEnvironmentData: { PYTHONPATH: '/opt/python' },
            configOptionData: {
                command: 'python',
                args: ['-m', 'my_mcp_server'],
                timeout: 15000,
            },
        },
        {
            name: 'Cloud Database API',
            type: 'streamable-http',
            configEnvironmentData: { REGION: 'us-west-2' },
            configOptionData: {
                url: 'https://db-api.example.com/mcp',
                authentication: {
                    type: 'api-key',
                    apiKey: 'sk-1234567890',
                },
            },
        },
    ];

    for (const config of configs) {
        console.log('\nProcessing config:', config.name);
        console.log('Type:', config.type);

        try {
            // Use type guards for safe casting
            if (isStdioTransport(config)) {
                console.log('  STDIO Command:', config.configOptionData.command);
                console.log('  Args:', config.configOptionData.args?.join(' ') || 'none');
                console.log('  Working Directory:', config.configOptionData.workingDirectory || 'default');
                console.log('  Timeout:', config.configOptionData.timeout || 'default');
            } else if (isStreamableHttpTransport(config)) {
                console.log('  HTTP URL:', config.configOptionData.url);
                console.log('  Headers:', JSON.stringify(config.configOptionData.headers || {}));
                console.log('  Auth Type:', config.configOptionData.authentication?.type || 'none');
                console.log('  Retry Attempts:', config.configOptionData.retryAttempts || 'default');
            }

            console.log('  Environment Variables:', JSON.stringify(config.configEnvironmentData));
        } catch (error) {
            console.error('  Error processing config:', error);
        }
    }
}

// =============================================================================
// EXAMPLE 4: FACTORY FUNCTIONS FOR CREATING CONFIGS
// =============================================================================

function demonstrateFactoryFunctions() {
    console.log('\n=== FACTORY FUNCTION EXAMPLES ===');

    // Create STDIO config using the new structure
    const stdioConfig: StdioTransportConfig = {
        name: 'Local Node.js Server',
        type: 'stdio',
        configEnvironmentData: { DEBUG: 'mcp*' },
        configOptionData: {
            command: 'node',
            args: ['server.js'],
            workingDirectory: '/app',
            timeout: 30000,
        },
    };

    console.log('STDIO Config:', JSON.stringify(stdioConfig, null, 2));

    // Create HTTP config using the new structure
    const httpConfig: StreamableHttpTransportConfig = {
        name: 'Production API Server',
        type: 'streamable-http',
        configEnvironmentData: { NODE_ENV: 'production' },
        configOptionData: {
            url: 'https://prod-api.example.com/mcp',
            timeout: 5000,
            retryAttempts: 2,
            authentication: {
                type: 'oauth',
                clientId: 'client-123',
                clientSecret: 'secret-456',
            },
        },
    };

    console.log('HTTP Config:', JSON.stringify(httpConfig, null, 2));
}

// =============================================================================
// EXAMPLE 5: USING MCP CONNECTION RECORDS (DATABASE STORAGE)
// =============================================================================

function demonstrateMcpConnectionRecords() {
    console.log('\n=== MCP CONNECTION RECORDS EXAMPLE ===');
    console.log('This shows how to create and manage MCP connections in the database:');

    // Example MCP connection creation
    console.log('\n1. Creating STDIO MCP Connection:');
    const stdioConnectionInput = {
        name: 'Local Development Server',
        description: 'A local MCP server for development and testing',
        serverName: 'dev-server',
        serverVersion: '1.0.0',
        transportConfigData: {
            name: 'Local Dev Transport',
            type: 'stdio' as const,
            configEnvironmentData: {
                DEBUG: 'mcp*',
                NODE_ENV: 'development',
            },
            configOptionData: {
                command: 'node',
                args: ['./dev-server.js'],
                workingDirectory: '/workspace/mcp-server',
                timeout: 30000,
            },
        },
        isEnabled: true,
    };

    console.log('STDIO Connection Input:', JSON.stringify(stdioConnectionInput, null, 2));

    console.log('\n2. Creating HTTP MCP Connection:');
    const httpConnectionInput = {
        name: 'Production API Server',
        description: 'Production MCP server with weather and data tools',
        serverName: 'weather-api',
        serverVersion: '2.1.0',
        transportConfigData: {
            name: 'Production API Transport',
            type: 'streamable-http' as const,
            configEnvironmentData: {
                API_ENVIRONMENT: 'production',
                LOG_LEVEL: 'info',
            },
            configOptionData: {
                url: 'https://api.weathermcp.com/mcp',
                timeout: 10000,
                retryAttempts: 3,
                headers: {
                    'User-Agent': 'AbyssMCP/1.0',
                },
                authentication: {
                    type: 'bearer' as const,
                    token: process.env.WEATHER_API_TOKEN || 'token-placeholder',
                },
            },
        },
        isEnabled: true,
    };

    console.log('HTTP Connection Input:', JSON.stringify(httpConnectionInput, null, 2));

    console.log('\n3. Usage in your application:');
    console.log('// Create MCP connection in database');
    console.log('const mcpConnection = await sqliteClient.tables.mcpConnection.newMcpConnection(stdioConnectionInput);');
    console.log('');
    console.log('// Update connection status after attempting to connect');
    console.log('const mcpRef = sqliteClient.tables.mcpConnection.ref(mcpConnection.id);');
    console.log('await mcpRef.updateConnectionStatus("connected");');
    console.log('');
    console.log('// Update capabilities after discovering server features');
    console.log('await mcpRef.updateCapabilities({');
    console.log('  resources: true,');
    console.log('  tools: true,');
    console.log('  prompts: false,');
    console.log('  logging: true');
    console.log('});');
    console.log('');
    console.log('// Enable/disable connections');
    console.log('await mcpRef.enable();');
    console.log('await mcpRef.disable();');
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function runExamples() {
    console.log('MCP Client Configuration Examples (Updated Structure)\n');
    console.log('This demonstrates the new 4-field transport configuration:');
    console.log('- name: Display name for the configuration');
    console.log('- type: Transport type (stdio | streamable-http)');
    console.log('- configEnvironmentData: Environment variables');
    console.log('- configOptionData: Type-specific options\n');

    // Run all examples
    await connectToLocalStdioServer();
    await connectToRemoteHTTPServer();
    await demonstrateTypeSafeCasting();
    demonstrateFactoryFunctions();
    demonstrateMcpConnectionRecords();

    console.log('\n=== SUMMARY OF NEW STRUCTURE ===');
    console.log('');
    console.log('For STDIO servers:');
    console.log('- configOptionData.command: Command to execute');
    console.log('- configOptionData.args: Command arguments');
    console.log('- configOptionData.workingDirectory: Working directory');
    console.log('- configOptionData.timeout: Connection timeout');
    console.log('- configEnvironmentData: Environment variables');
    console.log('');
    console.log('For Streamable HTTP servers:');
    console.log('- configOptionData.url: Server endpoint URL');
    console.log('- configOptionData.headers: Custom HTTP headers');
    console.log('- configOptionData.timeout: Request timeout');
    console.log('- configOptionData.retryAttempts: Number of retries');
    console.log('- configOptionData.authentication: Auth configuration');
    console.log('- configEnvironmentData: Environment variables');
    console.log('');
    console.log('All configs have type guards and factory functions for type safety!');
    console.log('Use the MCP connection records to persist configurations in the database.');
}

// Export for use in other modules
export type { McpConnectionTransportConfig, StdioTransportConfig, StreamableHttpTransportConfig };

export {
    connectToLocalStdioServer,
    connectToRemoteHTTPServer,
    demonstrateTypeSafeCasting,
    demonstrateFactoryFunctions,
    demonstrateMcpConnectionRecords,
    runExamples,
};

// Run examples if this file is executed directly
runExamples().catch(console.error);
