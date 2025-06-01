import type { SQliteClient } from '@abyss/records';
import { createContext, type ReactNode, useContext } from 'react';

interface DatabaseContextType {
    database: SQliteClient | null;
}

const DatabaseContext = createContext<DatabaseContextType>({ database: null });

interface DatabaseProviderProps {
    database: SQliteClient;
    children: ReactNode;
}

export function DatabaseProvider({ database, children }: DatabaseProviderProps) {
    return <DatabaseContext.Provider value={{ database }}>{children}</DatabaseContext.Provider>;
}

export function useDatabase(): SQliteClient {
    const context = useContext(DatabaseContext);
    if (!context.database) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context.database;
}
