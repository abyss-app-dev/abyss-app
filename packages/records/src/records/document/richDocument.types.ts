import { RichDocument } from './richDocument';

export interface BaseCell {
    id: string;
    editedAt: number;
}

export type CellText = BaseCell & {
    type: 'text';
    content: string;
};

export type CellHeader = BaseCell & {
    type: 'header';
    content: string;
};

export type CellHeader2 = BaseCell & {
    type: 'header2';
    content: string;
};

export type CellHeader3 = BaseCell & {
    type: 'header3';
    content: string;
};

export type CellXMLElement = BaseCell & {
    type: 'xmlElement';
    content: object;
};

export type CellCode = BaseCell & {
    type: 'code';
    content: string;
};

export type CellDocument = BaseCell & {
    type: 'document';
    content: {
        cells: Cell[];
    };
};

export type Cell = CellText | CellHeader | CellHeader2 | CellHeader3 | CellXMLElement | CellCode | CellDocument;
export type CellType = Cell['type'];

// Represents a static cell type which no longer needs to be compiled
export type StaticCellTemplate<IContent> = IContent | IContent[] | undefined;

// Represents a cell that is not yet compiled
export type DynamicCellTemplate<ICell extends Cell, TemplateParams = unknown> =
    | {
          type: 'static';
          data: Cell;
      }
    | {
          type: 'dynamic';
          outType: CellType;
          compile: (vars: TemplateParams) => StaticCellTemplate<ICell['content']>;
      };

// Type for function which builds a given cell type
export type DocumentBuilderParams<IContent, TemplateParams = unknown> =
    | StaticCellTemplate<IContent>
    | ((vars: TemplateParams) => StaticCellTemplate<IContent>);

export type CellTextParams<T> = DocumentBuilderParams<CellText['content'], T>;
export type CellHeaderParams<T> = DocumentBuilderParams<CellHeader['content'], T>;
export type CellHeader2Params<T> = DocumentBuilderParams<CellHeader2['content'], T>;
export type CellHeader3Params<T> = DocumentBuilderParams<CellHeader3['content'], T>;
export type CellXMLElementParams<T> = DocumentBuilderParams<CellXMLElement['content'], T>;
export type CellCodeParams<T> = DocumentBuilderParams<CellCode['content'], T>;
export type CellDocumentParams<T> = DocumentBuilderParams<CellDocument['content'], T>;
