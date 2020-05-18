import * as React from "react";
import {Grid, useTheme} from "@material-ui/core";
import {FormContext} from "@essence-community/constructor-share/context";
import cn from "clsx";
import {useObserver} from "mobx-react-lite";
import {IClassProps} from "@essence-community/constructor-share/types";
import {VAR_RECORD_PAGE_OBJECT_ID} from "@essence-community/constructor-share/constants";
import {mapComponents} from "@essence-community/constructor-share/components";
import {useStyles} from "./PanelWrapper.styles";

export const PanelWrapper: React.FC<IClassProps> = (props) => {
    const {children, bc} = props;
    const {topbtn, hideactions} = bc;
    const form = React.useContext(FormContext);
    const classes = useStyles();
    const theme = useTheme();
    const isDarkTheme = theme.palette.type === "dark";

    const actionsBar = React.useMemo(() => {
        if (hideactions === "true") {
            return null;
        }

        return (
            <Grid container alignItems="center" direction={isDarkTheme ? "column" : "row"} spacing={1}>
                {mapComponents(topbtn, (ChildComp, childBc) => {
                    const isAddButton = childBc.mode === "1";
                    const newChildBc = isAddButton
                        ? {...childBc, uitype: "4"}
                        : {...childBc, uitype: childBc.uitype === "1" ? "11" : childBc.uitype};

                    return (
                        <Grid item key={newChildBc[VAR_RECORD_PAGE_OBJECT_ID]}>
                            <ChildComp {...props} bc={newChildBc} />
                        </Grid>
                    );
                })}
            </Grid>
        );
    }, [hideactions, isDarkTheme, props, topbtn]);

    return useObserver(() => (
        <Grid
            container
            spacing={0}
            direction={isDarkTheme ? "row" : "column"}
            wrap="nowrap"
            className={cn({[classes.panelEditing]: form.editing})}
            data-page-object={bc[VAR_RECORD_PAGE_OBJECT_ID]}
        >
            <Grid item className={classes.actionsBar}>
                {actionsBar}
            </Grid>
            <Grid item xs zeroMinWidth className={cn({[classes.contentEditing]: form.editing})}>
                {children}
            </Grid>
        </Grid>
    ));
};
