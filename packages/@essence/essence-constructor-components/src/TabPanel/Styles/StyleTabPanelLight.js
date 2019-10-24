export const StyleTabPanelLight = (theme) => ({
    activeTabRoot: {
        backgroundColor: "#fff0e1",
        borderRight: `2px solid ${theme.palette.secondary.main}`,
        borderTop: `2px solid ${theme.palette.secondary.main}`,
    },
    selectedTabRoot: {
        "&$tabRoot": {
            background: "#e9ecf4",
        },
    },
    slimTab: {
        maxWidth: 70,
    },
    slimTabs: {
        flexWrap: "wrap-reverse",
    },
    "tabItem-center-hbox": {
        width: "100%",
    },
    "tabItem-left-hbox": {
        borderRight: `1px solid ${theme.palette.secondary.main}`,
    },
    "tabItem-left-vbox": {
        borderRight: `1px solid ${theme.palette.secondary.main}`,
    },
    "tabItem-right-hbox": {
        borderLeft: `1px solid ${theme.palette.secondary.main}`,
    },
    "tabItem-right-vbox": {
        borderLeft: `1px solid ${theme.palette.secondary.main}`,
    },
    tabRoot: {
        "&:hover": {
            background: "#e9ecf4",
        },
        borderRight: `1px solid ${theme.palette.secondary.main}`,
        borderTop: `1px solid ${theme.palette.secondary.main}`,
        borderTopRightRadius: 6,
        flexShrink: 1,
        height: 36,
        minHeight: 36,
        minWidth: 70,
        transformOrigin: "top",
    },
    tabWrapper: {
        display: "block",
        fontSize: 13,
        fontWeight: "bold",
        overflow: "hidden",
        padding: "0 4px",
        textOverflow: "ellipsis",
        textTransform: "none",
        whiteSpace: "nowrap",
        width: "100%",
    },
    tabsContainer: {
        outline: "none",
    },
    "tabsFlexContainer-center-hbox": {
        "& $tabRoot": {
            marginRight: 15,
            transform: "skewX(30deg)",
        },
        "& $tabWrapper": {
            transform: "skewX(-30deg)",
        },
        borderBottom: `2px solid ${theme.palette.secondary.main}`,
        flexDirection: "row-reverse",
        justifyContent: "flex-end",
        marginTop: 4,
    },
    "tabsFlexContainer-left-hbox": {
        "& $tabRoot": {
            borderBottom: `1px solid ${theme.palette.secondary.main}`,
            borderLeft: `1px solid ${theme.palette.secondary.main}`,
            borderRight: "none",
            borderTopLeftRadius: 6,
            borderTopRightRadius: 0,
            marginLeft: 20,
            marginRight: -20,
            transform: "skewX(-30deg)",
        },
        "& $tabWrapper": {
            textAlign: "start",
            transform: "skewX(30deg)",
        },
        flexDirection: "column-reverse",
        width: 264,
    },
    "tabsFlexContainer-left-vbox": {
        "& $tabRoot": {
            borderLeft: `1px solid ${theme.palette.secondary.main}`,
            borderRight: 0,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 0,
            height: "auto",
            marginBottom: 15,
            minWidth: 35,
            padding: "10px 0",
            transform: "skewY(-30deg)",
            width: 35,
        },
        "& $tabWrapper": {
            textAlign: "start",
            transform: "skewY(30deg) rotate(180deg)",
            writingMode: "vertical-rl",
        },
        flexDirection: "column-reverse",
        paddingTop: 10,
        width: 36,
    },
    "tabsFlexContainer-right-hbox": {
        "& $tabRoot": {
            borderBottom: `1px solid ${theme.palette.secondary.main}`,
            marginLeft: -20,
            transform: "skewX(30deg)",
        },
        "& $tabWrapper": {
            textAlign: "start",
            transform: "skewX(-30deg)",
        },
        flexDirection: "column-reverse",
        width: 264,
    },
    "tabsFlexContainer-right-vbox": {
        "& $tabRoot": {
            height: "auto",
            marginBottom: 15,
            minWidth: 35,
            padding: "10px 0",
            transform: "skewY(30deg)",
            width: 35,
        },
        "& $tabWrapper": {
            textAlign: "start",
            transform: "skewY(-30deg)",
            writingMode: "vertical-rl",
        },
        flexDirection: "column-reverse",
        paddingTop: 10,
        width: 36,
    },
    tabsIndicator: {
        display: "none",
    },
    tabsRoot: {
        display: "block",
        marginBottom: -5,
        minHeight: 38,
    },
});
