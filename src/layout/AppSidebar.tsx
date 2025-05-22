import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Overview", path: "/", pro: false }],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Products",
    subItems: [
      { name: "All Products", path: "/products", pro: false },
      { name: "Add Product", path: "/add-product", pro: false },
      { name: "Categories", path: "/categories", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Customers",
    subItems: [
      { name: "Customer List", path: "/customers", pro: false },
      // { name: "Add Customer", path: "/add-customer", pro: false },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Orders",
    subItems: [
      { name: "Order List", path: "/orders", pro: false },
      // { name: "Order Details", path: "/order-details", pro: false },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Inventory",
    path: "/inventory",
  },
  {
    name: "Reports",
    icon: <PieChartIcon />,
    subItems: [
      { name: "Sales Report", path: "/sales-report", pro: false },
      // { name: "Inventory Report", path: "/inventory-report", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  //   // {
  //   //   icon: <CalenderIcon />,
  //   //   name: "Calendar",
  //   //   path: "/calendar",
  //   // },
  //   // {
  //   //   icon: <PageIcon />,
  //   //   name: "Pages",
  //   //   subItems: [
  //   //     { name: "Profile", path: "/profile", pro: false },
  //   //     { name: "Settings", path: "/settings", pro: false },
  //   //     { name: "Blank Page", path: "/blank", pro: false },
  //   //     { name: "404 Error", path: "/error-404", pro: false },
  //   //   ],
  //   // },
  //   // {
  //   //   icon: <PlugInIcon />,
  //   //   name: "Authentication",
  //   //   subItems: [
  //   //     { name: "Sign In", path: "/signin", pro: false },
  //   //     { name: "Sign Up", path: "/signup", pro: false },
  //   //   ],
  //   // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='80'%20height='33'%20fill='none'%3e%3cpath%20fill='%232A2A86'%20d='M30.18%2020.503a3.98%203.98%200%200%201-3.636-2.34%203.97%203.97%200%200%201%20.652-4.27%203.98%203.98%200%200%201%204.17-1.15%203.98%203.98%200%200%201%202.758%203.328h3.996a7.95%207.95%200%200%200-2.571-5.405%207.98%207.98%200%200%200-11.104.32%207.95%207.95%200%200%200%200%2011.09%207.977%207.977%200%200%200%2011.104.32%207.95%207.95%200%200%200%202.57-5.405h-3.98a3.97%203.97%200%200%201-1.31%202.509%203.98%203.98%200%200%201-2.649%201.003M16.606%209.047v7.742c0%202.026-1.764%203.667-3.75%203.667s-3.765-1.648-3.765-3.667V9.047H5.334v7.742c0%201.008.195%202.006.573%202.937.378.93.932%201.777%201.63%202.489a7.5%207.5%200%200%200%202.441%201.663%207.4%207.4%200%200%200%202.879.583c1.433%200%202.536-.372%203.749-1.505v1.528c0%202.026-1.564%203.667-3.75%203.667-2.184%200-3.92-1.645-3.92-3.667H5.334A7.75%207.75%200%200%200%207.58%2029.83a7.45%207.45%200%200%200%205.276%202.204%207.45%207.45%200%200%200%205.275-2.204%207.75%207.75%200%200%200%202.246-5.345V9.061z'/%3e%3cpath%20fill='%23FCAF17'%20d='M68.896%209.047v8.04c0%202.103-1.868%203.807-3.97%203.807s-3.987-1.708-3.987-3.807v-8.04h-3.978v8.04a7.97%207.97%200%200%200%204.917%207.361c.967.4%202.002.607%203.048.606%201.518%200%202.685-.386%203.97-1.563v1.587c0%202.103-1.656%203.807-3.97%203.807s-4.151-1.708-4.151-3.807h-3.814a7.963%207.963%200%200%200%2015.928%200V9.062zM51.854.916v9.033a7%207%200%200%200-4.132-1.38c-4.202%200-7.618%203.383-7.853%207.64h4.025a4.08%204.08%200%200%201%201.416-2.648%204.027%204.027%200%200%201%205.542.322%204.09%204.09%200%200%201%201.104%202.795c0%201.04-.395%202.04-1.104%202.795a4.027%204.027%200%200%201-5.543.322%204.08%204.08%200%200%201-1.415-2.648H39.87c.237%204.26%203.662%207.639%207.853%207.639a7.2%207.2%200%200%200%204.162-1.417l.571%201.23h3.343V.917z'/%3e%3c/svg%3e"
                alt="Yody Logo"
              />
              <img
                className="hidden dark:block"
                src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='80'%20height='33'%20fill='none'%3e%3cpath%20fill='%232A2A86'%20d='M30.18%2020.503a3.98%203.98%200%200%201-3.636-2.34%203.97%203.97%200%200%201%20.652-4.27%203.98%203.98%200%200%201%204.17-1.15%203.98%203.98%200%200%201%202.758%203.328h3.996a7.95%207.95%200%200%200-2.571-5.405%207.98%207.98%200%200%200-11.104.32%207.95%207.95%200%200%200%200%2011.09%207.977%207.977%200%200%200%2011.104.32%207.95%207.95%200%200%200%202.57-5.405h-3.98a3.97%203.97%200%200%201-1.31%202.509%203.98%203.98%200%200%201-2.649%201.003M16.606%209.047v7.742c0%202.026-1.764%203.667-3.75%203.667s-3.765-1.648-3.765-3.667V9.047H5.334v7.742c0%201.008.195%202.006.573%202.937.378.93.932%201.777%201.63%202.489a7.5%207.5%200%200%200%202.441%201.663%207.4%207.4%200%200%200%202.879.583c1.433%200%202.536-.372%203.749-1.505v1.528c0%202.026-1.564%203.667-3.75%203.667-2.184%200-3.92-1.645-3.92-3.667H5.334A7.75%207.75%200%200%200%207.58%2029.83a7.45%207.45%200%200%200%205.276%202.204%207.45%207.45%200%200%200%205.275-2.204%207.75%207.75%200%200%200%202.246-5.345V9.061z'/%3e%3cpath%20fill='%23FCAF17'%20d='M68.896%209.047v8.04c0%202.103-1.868%203.807-3.97%203.807s-3.987-1.708-3.987-3.807v-8.04h-3.978v8.04a7.97%207.97%200%200%200%204.917%207.361c.967.4%202.002.607%203.048.606%201.518%200%202.685-.386%203.97-1.563v1.587c0%202.103-1.656%203.807-3.97%203.807s-4.151-1.708-4.151-3.807h-3.814a7.963%207.963%200%200%200%2015.928%200V9.062zM51.854.916v9.033a7%207%200%200%200-4.132-1.38c-4.202%200-7.618%203.383-7.853%207.64h4.025a4.08%204.08%200%200%201%201.416-2.648%204.027%204.027%200%200%201%205.542.322%204.09%204.09%200%200%201%201.104%202.795c0%201.04-.395%202.04-1.104%202.795a4.027%204.027%200%200%201-5.543.322%204.08%204.08%200%200%201-1.415-2.648H39.87c.237%204.26%203.662%207.639%207.853%207.639a7.2%207.2%200%200%200%204.162-1.417l.571%201.23h3.343V.917z'/%3e%3c/svg%3e"
                alt="Yody Logo"
              />
            </>
          ) : (
            <img
              src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='80'%20height='33'%20fill='none'%3e%3cpath%20fill='%232A2A86'%20d='M30.18%2020.503a3.98%203.98%200%200%201-3.636-2.34%203.97%203.97%200%200%201%20.652-4.27%203.98%203.98%200%200%201%204.17-1.15%203.98%203.98%200%200%201%202.758%203.328h3.996a7.95%207.95%200%200%200-2.571-5.405%207.98%207.98%200%200%200-11.104.32%207.95%207.95%200%200%200%200%2011.09%207.977%207.977%200%200%200%2011.104.32%207.95%207.95%200%200%200%202.57-5.405h-3.98a3.97%203.97%200%200%201-1.31%202.509%203.98%203.98%200%200%201-2.649%201.003M16.606%209.047v7.742c0%202.026-1.764%203.667-3.75%203.667s-3.765-1.648-3.765-3.667V9.047H5.334v7.742c0%201.008.195%202.006.573%202.937.378.93.932%201.777%201.63%202.489a7.5%207.5%200%200%200%202.441%201.663%207.4%207.4%200%200%200%202.879.583c1.433%200%202.536-.372%203.749-1.505v1.528c0%202.026-1.564%203.667-3.75%203.667-2.184%200-3.92-1.645-3.92-3.667H5.334A7.75%207.75%200%200%200%207.58%2029.83a7.45%207.45%200%200%200%205.276%202.204%207.45%207.45%200%200%200%205.275-2.204%207.75%207.75%200%200%200%202.246-5.345V9.061z'/%3e%3cpath%20fill='%23FCAF17'%20d='M68.896%209.047v8.04c0%202.103-1.868%203.807-3.97%203.807s-3.987-1.708-3.987-3.807v-8.04h-3.978v8.04a7.97%207.97%200%200%200%204.917%207.361c.967.4%202.002.607%203.048.606%201.518%200%202.685-.386%203.97-1.563v1.587c0%202.103-1.656%203.807-3.97%203.807s-4.151-1.708-4.151-3.807h-3.814a7.963%207.963%200%200%200%2015.928%200V9.062zM51.854.916v9.033a7%207%200%200%200-4.132-1.38c-4.202%200-7.618%203.383-7.853%207.64h4.025a4.08%204.08%200%200%201%201.416-2.648%204.027%204.027%200%200%201%205.542.322%204.09%204.09%200%200%201%201.104%202.795c0%201.04-.395%202.04-1.104%202.795a4.027%204.027%200%200%201-5.543.322%204.08%204.08%200%200%201-1.415-2.648H39.87c.237%204.26%203.662%207.639%207.853%207.639a7.2%207.2%200%200%200%204.162-1.417l.571%201.23h3.343V.917z'/%3e%3c/svg%3e"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
