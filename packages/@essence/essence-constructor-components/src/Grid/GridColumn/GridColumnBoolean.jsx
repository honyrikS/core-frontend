// @flow
import {withTranslation, WithT} from "@essence/essence-constructor-share/utils";
import {type GridColumnPropsType} from "./GridColumnTypes";

// eslint-disable-next-line id-length
const GridColumnBooleanBuilder = ({value, t}: GridColumnPropsType & WithT) =>
    value ? t("dacf7ab025c344cb81b700cfcc50e403") : t("f0e9877df106481eb257c2c04f8eb039");

export const GridColumnBoolean = withTranslation("meta")(GridColumnBooleanBuilder);
export default GridColumnBoolean;
