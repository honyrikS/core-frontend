// @flow
import * as React from "react";
import {Dialog, DialogTitle, Grid, DialogContent, Switch, DialogActions, Button} from "@material-ui/core";
import {withTranslation, WithT} from "@essence/essence-constructor-share/utils";
import noop from "lodash/noop";
import BuilderMobxButton from "../../../Button/BuilderMobxButton";
import {type PageModelType} from "../../../stores/PageModel";
import {type GridModelType} from "../../../stores/GridModel";
import Scrollbars from "../../../Components/Scrollbars/Scrollbars";

type PropsType = WithT & {
    pageStore: PageModelType,
    gridStore: GridModelType,
    buttonProps: Object,
    onClose: () => void,
};

type StateType = {
    open: boolean,
    visibility: {
        [$Keys: string]: boolean,
    },
};

class GridSettings extends React.Component<PropsType, StateType> {
    static defaultProps = {
        onClose: noop,
    };

    state = {
        open: false,
        visibility: {},
    };

    bc = {
        ckPageObject: "gridsettings",
        cvDisplayed: "102972d8258947b7b3cf2b70b258278a",
        iconfont: "fa-sliders",
        onlyicon: "true",
        type: "BTN",
    };

    handleOpen = () => {
        const {gridStore} = this.props;
        const visibility = {};

        gridStore.gridColumns.forEach((column) => {
            visibility[column.ckPageObject] = true;
        });

        this.setState({open: true, visibility});
    };

    handleClose = () => {
        this.setState({open: false});
        this.props.onClose();
    };

    handleChangeVisibility = (event: SyntheticEvent<HTMLInputElement>) => {
        const {name, checked} = event.currentTarget;

        this.setState((prevState) => ({
            visibility: {
                ...prevState.visibility,
                [name]: checked,
            },
        }));
    };

    handleSave = () => {
        const {gridStore} = this.props;
        const {visibility} = this.state;

        gridStore.setGridColumns(gridStore.gridColumnsInitial.filter((column) => visibility[column.ckPageObject]));
        this.handleClose();
    };

    render() {
        // eslint-disable-next-line id-length
        const {pageStore, buttonProps, gridStore, t} = this.props;
        const {visibility} = this.state;

        return (
            <React.Fragment>
                <BuilderMobxButton
                    bc={this.bc}
                    handleClick={this.handleOpen}
                    pageStore={pageStore}
                    color="inherit"
                    visible
                    {...buttonProps}
                    readOnly={false}
                />
                <Dialog
                    open={this.state.open}
                    maxWidth="sm"
                    fullWidth
                    container={pageStore.pageEl}
                    style={{position: "absolute"}}
                >
                    <DialogTitle disableTypography>{t("017af47503474ec58542b9db53bdeeff")}</DialogTitle>
                    <DialogContent>
                        <Scrollbars autoHeight autoHeightMax={300} autoHeightMin={38}>
                            <Grid container direction="column" spacing={0} style={{width: "100%"}}>
                                {gridStore.gridColumnsInitial.map((column) => {
                                    const {visible, hiddenrules} = column;

                                    if (visible === "false" || hiddenrules === "true") {
                                        return null;
                                    }

                                    return (
                                        <Grid item key={column.ckPageObject}>
                                            <Grid container>
                                                <Grid item xs={10}>
                                                    {t(column.cvDisplayed) ||
                                                        `${t("223dbd23bba54e4c91f59ef4cdea8ffa")}  ${column.datatype}`}
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Switch
                                                        name={column.ckPageObject}
                                                        checked={visibility[column.ckPageObject]}
                                                        disableRipple
                                                        onChange={this.handleChangeVisibility}
                                                        value={column.ckPageObject}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Scrollbars>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleSave} color="primary" disableRipple variant="contained">
                            {t("8a930c6b5dd440429c0f0e867ce98316")}
                        </Button>
                        <Button onClick={this.handleClose} color="secondary" disableRipple variant="contained">
                            {t("64aacc431c4c4640b5f2c45def57cae9")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withTranslation("meta")(GridSettings);
