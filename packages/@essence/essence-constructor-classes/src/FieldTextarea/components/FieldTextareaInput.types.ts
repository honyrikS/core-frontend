import {IBuilderConfig} from "@essence/essence-constructor-share";

export interface IFieldTextareaInputProps {
    height: number;
    bc: IBuilderConfig;
    editing?: boolean;
    inputRef: React.MutableRefObject<null | HTMLTextAreaElement>;
    onChangeHeight: (height: number) => void;
}
