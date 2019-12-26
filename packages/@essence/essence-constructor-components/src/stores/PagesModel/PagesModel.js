// @flow
import {extendObservable, action, observable} from "mobx";
import {
    getFromStore,
    saveToStore,
    removeFromStore,
    removeFromStoreByRegex,
} from "@essence/essence-constructor-share/utils";
import {STORE_PAGES_IDS_KEY, STORE_LAST_CV_LOGIN_KEY} from "../../constants";
import {type CkIdType} from "../../BuilderType";
import {changePagePosition} from "../../utils/changePagePosition";
import {PageModel, type PageModelType} from "../PageModel";
import {GlobalRecordsModel, type GlobalRecordsModelType} from "../GlobalRecordsModel";
import {type ApplicationModelType} from "../StoreTypes";
import {type RoutesModelType} from "../RoutesModel";
import {type PagesModelInterface, type PagesModelPropsType} from "./PagesModelType";

export class PagesModel implements PagesModelInterface {
    pages: Array<PageModelType>;

    activePage: ?PageModelType;

    globalPageStore: PageModelType;

    applicationStore: ApplicationModelType;

    routesStore: RoutesModelType;

    history: History;

    expansionRecords: Map<CkIdType, boolean>;

    globalRecordsStore: GlobalRecordsModelType;

    constructor({applicationStore, routesStore, history}: PagesModelPropsType) {
        this.globalPageStore = new PageModel({applicationStore, isActiveRedirect: false, pageId: "-1", routesStore});
        this.applicationStore = applicationStore;
        this.routesStore = routesStore;
        this.history = history;
        this.globalRecordsStore = new GlobalRecordsModel({pageStore: this.globalPageStore});

        extendObservable(this, {
            activePage: null,
            expansionRecords: observable.map(),
            pages: [],
        });
    }

    loadActivePage = (pageId: string, autoset: boolean = true, isActiveRedirect: boolean = false) => {
        const activePage = new PageModel({
            applicationStore: this.applicationStore,
            isActiveRedirect,
            pageId,
            routesStore: this.routesStore,
        });

        this.pages.push(activePage);

        if (autoset) {
            this.activePage = activePage;
        }

        return activePage.loadConfigAction(pageId, this.applicationStore.session).then(() => activePage);
    };

    reloadPageAction = (pageId: string) => {
        const activePage = this.pages.find((page) => page.pageId === pageId);

        if (activePage) {
            activePage.reloadPageAction();
        }
    };

    setPageAction = action("addPage", async (pageId: string, isActiveRedirect: boolean = false) => {
        if (pageId === "-1") {
            return false;
        }

        let activePage = this.pages.find((page) => page.pageId === pageId);

        if (activePage) {
            this.activePage = activePage;
        } else {
            activePage = await this.loadActivePage(pageId, true, isActiveRedirect);
        }

        saveToStore(
            STORE_PAGES_IDS_KEY,
            this.pages.map((page) => page.pageId),
        );

        return activePage;
    });

    removePageAction = action("addPage", (pageId: string) => {
        const selectedPage = this.pages.find((page) => page.pageId === pageId);

        if (selectedPage) {
            selectedPage.clearAction();
            selectedPage.removePageAction();

            // $FlowFixMe
            this.pages.remove(selectedPage);
        }

        if (selectedPage === this.activePage) {
            this.activePage = this.pages.length ? this.pages[0] : null;
        }

        saveToStore(
            STORE_PAGES_IDS_KEY,
            this.pages.map((page) => page.pageId),
        );
    });

    removePageOtherAction = action("removePageOtherAction", (ckPageLost: CkIdType) => {
        this.pages.slice().forEach((page) => {
            if (page.pageId !== ckPageLost) {
                page.removePageAction();
                // $FlowFixMe
                this.pages.remove(page);
            }
        });

        this.activePage = this.pages[0] || null;
        saveToStore(
            STORE_PAGES_IDS_KEY,
            this.pages.map((page) => page.pageId),
        );
    });

    removeAllPagesAction = action("removeAllPagesAction", () => {
        this.activePage = null;
        this.pages.forEach((page) => {
            page.removePageAction();
        });
        this.pages = [];
        removeFromStore(STORE_PAGES_IDS_KEY);
    });

    removeAllPagesRightAction = action("removeAllPagesRightAction", (pageId: string) => {
        const pageIndex = this.pages.findIndex((page) => page.pageId === pageId);

        this.pages.slice(pageIndex + 1).forEach((page) => {
            page.removePageAction();
            // $FlowFixMe
            this.pages.remove(page);
        });

        const activePage = this.pages.find((page) => page === this.activePage);

        if (!activePage) {
            this.activePage = this.pages[0] || null;
        }

        saveToStore(
            STORE_PAGES_IDS_KEY,
            this.pages.map((page) => page.pageId),
        );
    });

    openCloseExpansionAction = action("openCloseExpansionAction", (ckId: CkIdType) => {
        this.expansionRecords.set(ckId, !this.expansionRecords.get(ckId));
    });

    restorePagesAction = action("restorePagesAction", (login: string) => {
        // TODO: удалить преобразование в строку в 1.25.0, убедится что все обновлены на 1.24.0
        const pagesIds = getFromStore(STORE_PAGES_IDS_KEY, []).map(String);
        const lastCvLogin = getFromStore(STORE_LAST_CV_LOGIN_KEY);
        const promise = Promise.resolve();

        if (login === lastCvLogin) {
            pagesIds.forEach((pageId) => {
                const activePage = this.pages.find((page) => page.pageId === pageId);

                if (!activePage) {
                    const page = new PageModel({
                        applicationStore: this.applicationStore,
                        isActiveRedirect: false,
                        pageId,
                        routesStore: this.routesStore,
                    });

                    this.pages.push(page);

                    promise.then(() => page.loadConfigAction(pageId, this.applicationStore.session));
                }
            });
        } else {
            removeFromStoreByRegex(/_filter_/u);
        }

        this.globalRecordsStore.loadAllStoresAction(this.applicationStore);

        saveToStore(STORE_LAST_CV_LOGIN_KEY, login);
    });

    movePages = (dragIndex: number, hoverIndex: number) => {
        this.pages = changePagePosition(this.pages, dragIndex, hoverIndex);

        saveToStore(
            STORE_PAGES_IDS_KEY,
            this.pages.map((page) => page.pageId),
        );
    };
}
