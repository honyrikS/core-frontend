import {getComponent} from "@essence-community/constructor-share";
import FieldDateRC from "./FieldDateRC/FieldDateRC";
import FieldMulti from "./FieldMulti/FieldMulti";
import FieldSmartMask from "./FieldSmartMask/FieldSmartMask";
import FieldGroup from "./FieldGroup/FieldGroup";
import FieldPassword from "./FieldPassword/FieldPassword";
import FieldColorPicker from "./FieldColorPicker/FieldColorPicker";
import FieldRadioGroup from "./FieldRadioGroup/FieldRadioGroup";
import FieldImage from "./FieldImage/FieldImage";

export const fieldMap = {
    addr: FieldMulti,
    color: FieldColorPicker,
    date: FieldDateRC,
    group: FieldGroup,
    image: FieldImage,
    mo: FieldMulti,
    password: FieldPassword,
    radio: FieldRadioGroup,
};

export const getFieldInstance = (config) => {
    if (config.imask) {
        return config.imask.indexOf("!") === 0 ? FieldSmartMask : null;
    }

    const component = getComponent(`${config.type}.${config.datatype.toUpperCase()}`);

    return component || fieldMap[config.datatype];
};
