/* eslint-disable jsx-a11y/href-no-hash */
import React, {Component} from "react";
import {Provider} from "mobx-react";
import {createMuiTheme, CssBaseline} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";
import moment from "moment";
import "moment/locale/ru";
import {SnackbarMobx, themeVars, Tooltip} from "@essence/essence-constructor-components";
import HTML5Backend from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";
import {Block} from "./Components/Block/Block";
import Settings from "./Components/Settings/Settings";
import AppRoutes from "./AppRoutes";
import {stores} from "./Stores/stores";

themeVars.typography.fontFamily = `"Uni Neue Regular", ${themeVars.typography.fontFamily}`;

const theme = createMuiTheme(themeVars);

moment.locale("ru");

class App extends Component {
    renderDevTools = () => {
        if (process.env.REACT_APP_SHOW_DEV_TOOLS === "true") {
            // eslint-disable-next-line global-require
            const DevTools = require("mobx-react-devtools").default;

            return <DevTools position={{bottom: 0, right: 20}} />;
        }

        return null;
    };

    render() {
        return (
            <Provider {...stores}>
                <ThemeProvider theme={theme}>
                    <DndProvider backend={HTML5Backend}>
                        <Settings applicationStore={stores.applicationStore}>
                            <AppRoutes />
                            <CssBaseline />
                            <SnackbarMobx
                                snackbars={stores.applicationStore.snackbarStore.snackbars}
                                onClose={stores.applicationStore.snackbarStore.snackbarCloseAction}
                                onSetCloseble={stores.applicationStore.snackbarStore.setClosebleAction}
                            />
                            <Tooltip />
                            <Block applicationStore={stores.applicationStore} />
                            {this.renderDevTools()}
                        </Settings>
                    </DndProvider>
                </ThemeProvider>
            </Provider>
        );
    }
}

export default App;
