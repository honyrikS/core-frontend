import {IClassProps, ApplicationContext, IRouteRecord} from "@essence-community/constructor-share";
import {toSize} from "@essence-community/constructor-share/utils/transform";
import {
    VAR_RECORD_ID,
    VAR_RECORD_ROUTE_NAME,
    VAR_RECORD_ICON_NAME,
    VAR_RECORD_ROUTE_VISIBLE_MENU,
} from "@essence-community/constructor-share/constants/variables";
import {Tabs} from "@material-ui/core";
import {useObserver} from "mobx-react-lite";
import * as React from "react";
import {useTranslation} from "@essence-community/constructor-share/utils";
import DragComponent from "../../DragComponent";
import {OpenPageMenuContext} from "../components/OpenPageMenuContext/OpenPageMenuContext";
import {OpenPageTab} from "../components/OpenPageTab/OpenPageTab";
import {ScrollButton} from "../components/ScrollButton/ScrollButton";
import {useStyles} from "./OpenPageTabs.styles";

export interface IRoute extends IRouteRecord {
    [VAR_RECORD_ID]: string;
    [VAR_RECORD_ROUTE_NAME]: string;
    [VAR_RECORD_ICON_NAME]: string | undefined;
}

export const OpenPageTabs: React.FC<IClassProps> = (props) => {
    const classes = useStyles(props);
    const applicationStore = React.useContext(ApplicationContext);

    if (!applicationStore) {
        throw new Error("Not found applicationStore");
    }
    const {bc} = props;
    const contentStyle = React.useMemo(
        () => ({
            height: toSize(bc.height, "42"),
            maxHeight: toSize(bc.maxheight, "100%"),
            minHeight: toSize(bc.minheight, ""),
        }),
        [bc.height, bc.maxheight, bc.minheight],
    );
    const orientation = bc.contentview === "vbox" ? "vertical" : "horizontal";
    const {pagesStore} = applicationStore;
    const [isOpenMenu, setIsOpenMenu] = React.useState(false);
    const [menuPageValue, setMenuPageValue] = React.useState("");
    const [menuPosition, setMenuPosition] = React.useState({
        left: 0,
        top: 0,
    });
    const handleChangePage = (event: React.ChangeEvent, value: string) => {
        pagesStore.setPageAction(value, false);
    };
    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, value: string) => {
        event.preventDefault();
        setIsOpenMenu(true);
        setMenuPageValue(value);
        setMenuPosition({
            left: event.pageX,
            top: event.pageY,
        });
    };
    const handleCloseMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        setIsOpenMenu(false);
    };
    const handleMovePage = (dragIndex: number, hoverIndex: number) => {
        pagesStore.movePages(dragIndex, hoverIndex);
    };
    const renderTabComponent = (propsTab: any) => <DragComponent {...propsTab} type="page" moveCard={handleMovePage} />;
    const [trans] = useTranslation("meta");

    return useObserver(() => (
        <React.Fragment>
            <Tabs
                value={pagesStore.activePage ? pagesStore.activePage.pageId : false}
                classes={{
                    flexContainer: classes.tabsFlexContainer,
                    root: classes.tabsRoot,
                    scroller: classes.scroller,
                }}
                variant="scrollable"
                orientation={orientation}
                scrollButtons="on"
                ScrollButtonComponent={ScrollButton}
                style={contentStyle}
                onChange={handleChangePage}
            >
                {pagesStore.pages
                    .filter(({route}) => route && route[VAR_RECORD_ROUTE_VISIBLE_MENU])
                    .map((page, index) => {
                        const {route, pageId} = page;
                        const name: any = route && route[VAR_RECORD_ROUTE_NAME];
                        const iconName: any = route && route[VAR_RECORD_ICON_NAME];

                        return (
                            <OpenPageTab
                                key={pageId}
                                pageId={pageId}
                                pageIndex={index}
                                component={renderTabComponent}
                                label={trans(name)}
                                iconfont={iconName}
                                value={pageId}
                                onClose={pagesStore.removePageAction}
                                onContextMenuCustom={handleContextMenu}
                                orientation={orientation}
                                style={contentStyle}
                            />
                        );
                    })}
            </Tabs>
            <OpenPageMenuContext
                open={isOpenMenu}
                value={menuPageValue}
                onClose={pagesStore.removePageAction}
                onCloseMenu={handleCloseMenu}
                position={menuPosition}
                pagesStore={pagesStore}
            />
        </React.Fragment>
    ));
};
