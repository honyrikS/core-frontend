import {IApplicationModel, IPageModel, IBuilderConfig} from "@essence-community/constructor-share/types";
import {IPopoverContext} from "@essence-community/constructor-share/context";
import {IForm} from "@essence-community/constructor-share/Form";

export interface IHanderOptions {
    applicationStore: IApplicationModel;
    pageStore: IPageModel;
    bc: IBuilderConfig;
    files?: File[];
    form?: IForm;
    popoverCtx: IPopoverContext;
}
export type Handler = Record<string, (options: IHanderOptions) => void>;
