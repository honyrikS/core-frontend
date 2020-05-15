import * as React from "react";
import {IClassProps} from "@essence-community/constructor-share/types";
import {useField} from "@essence-community/constructor-share/Form";
import {useTextFieldProps} from "@essence-community/constructor-share/hooks";
import {TextFieldMask} from "@essence-community/constructor-share/uicomponents";
import {TextField} from "@material-ui/core";

export const FieldTextContainer: React.FC<IClassProps> = (props) => {
    const {bc} = props;

    const field = useField({
        bc,
        pageStore: props.pageStore,
    });
    const inputProps = useTextFieldProps({bc: props.bc, disabled: props.disabled, field});
    const handleChange = React.useCallback(
        (event: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            field.onChange(event.currentTarget.value);
        },
        [field],
    );

    if (bc.imask) {
        return <TextFieldMask textFieldProps={inputProps} imask={bc.imask} onChange={handleChange} />;
    }

    return <TextField {...inputProps} onChange={handleChange} />;
};
