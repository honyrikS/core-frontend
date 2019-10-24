import {IEssenceTheme} from "@essence/essence-constructor-share";
import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: IEssenceTheme) => ({
    chevronRoot: {
        boxSizing: "content-box",
        width: 17,
    },
    favoriteRoot: {
        alignItems: "center",
        bottom: 0,
        display: "none",
        left: 10,
        position: "absolute",
        top: 0,
    },
    favoriteSelected: {
        "&$favoriteRoot": {
            display: "flex",
        },
    },
    folrderRoot: {
        boxSizing: "content-box",
        width: 23,
    },
    iconRoot: {
        "&:empty": {
            display: "block",
        },
        boxSizing: "content-box",
        height: 23,
        textAlign: "center",
        width: 23,
    },
    nameTypography: {
        fontSize: 15,
    },
    root: {
        "&:hover": {
            "& $favoriteRoot": {
                display: "flex",
            },
            backgroundColor: theme.essence.palette.common.selectedMenu,
        },
        color: theme.essence.palette.common.white,
        cursor: "pointer",
        position: "relative",
    },
    rootGrid: {
        marginBottom: 0,
        marginTop: 0,
        minHeight: 42,
        padding: "0 10px",
    },
}));
