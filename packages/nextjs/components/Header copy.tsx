"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowPathIcon,
  BugAntIcon,
  PhotoIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  subMenu?: HeaderMenuLink[];
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "铸造NFT",
    href: "/create",
    icon: <PhotoIcon className="h-4 w-4" />,
  },
  {
    label: "NFT市场",
    href: "/market",
    icon: <PhotoIcon className="h-4 w-4" />,
    subMenu: [
      { label: "热门NFT", href: "/market/popular" },
      { label: "最新上架", href: "/market/new" },
    ],
  },
  {
    label: "买卖记录",
    href: "/transfers",
    icon: <ArrowPathIcon className="h-4 w-4" />,
  },
  {
    label: "调试合约",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
    subMenu: [
      { label: "基础调试", href: "/debug/basic" },
      { label: "高级调试", href: "/debug/advanced" },
    ],
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon, subMenu }) => {
        const isActive = pathname === href;
        return (
          <li key={label} className="relative group">
            <Link
              href={href || "#"}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full flex items-center gap-2`}
            >
              {icon}
              <span>{label}</span>
            </Link>
            {subMenu && (
              <ul className="hidden group-hover:block absolute left-0 top-full mt-1 bg-base-100 shadow-lg rounded-box p-2 w-40">
                {subMenu.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href || "#"}
                      passHref
                      className="hover:bg-secondary hover:text-white py-1 px-3 text-sm rounded-md block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header with support for nested menus
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="sticky xl:static top-0 navbar bg-primary min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto xl:w-1/2">
        {/* Mobile dropdown */}
        <div className="xl:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen((prevIsOpenState) => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>

        {/* Desktop menu */}
        <Link href="/" passHref className="hidden xl:flex items-center gap-1 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/wx.jpg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">huahua</span>
            <span className="text-xs">Simple NFT</span>
          </div>
        </Link>
        <ul className="hidden xl:flex xl:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
