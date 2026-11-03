import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadModule(path, mockedDeps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  const mod = { exports };
  vm.runInNewContext(output, {
    exports,
    module: mod,
    require(name) {
      if (name in mockedDeps) return mockedDeps[name];
      if (name === "react") return React;
      if (name === "react/jsx-runtime") return require("react/jsx-runtime");
      if (name === "react/jsx-dev-runtime")
        return require("react/jsx-dev-runtime");
      if (name === "cn")
        return { cn: (...classes) => classes.filter(Boolean).join(" ") };
      if (name === "lucide-react") return require("lucide-react");
      if (name === "next/navigation") {
        return {
          useRouter: () => ({
            push: () => {},
            refresh: () => {},
          }),
        };
      }
      if (name === "next-intl")
        return {
          useTranslations: () => (key) =>
            key === "signOut" ? "Sign out" : key,
        };
      if (name === "@/components/ui/alert")
        return { Alert: "div", AlertDescription: "p" };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return mod.exports;
}

test("HeaderDesktopAuth and HeaderMobileAuth adapt dynamically to authentication state", async (t) => {
  let sessionState = { data: null };

  const buttonModule = loadModule("../components/ui/button.tsx", {
    "@base-ui/react/button": {
      Button: ({ children, className, ...props }) =>
        React.createElement("button", { className, ...props }, children),
    },
    "class-variance-authority": {
      cva: () => (props) =>
        `btn ${props?.variant || "default"} ${props?.size || "default"} ${props?.className || ""}`,
    },
  });

  const avatarModule = loadModule("../components/ui/avatar.tsx", {
    "@base-ui/react/avatar": {
      Avatar: {
        Root: ({ children, className, ...props }) =>
          React.createElement(
            "div",
            { className: `avatar-root ${className || ""}`, ...props },
            children,
          ),
        Image: ({ className, src, alt, ...props }) =>
          React.createElement("img", {
            className: `avatar-img ${className || ""}`,
            src,
            alt,
            ...props,
          }),
        Fallback: ({ children, className, ...props }) =>
          React.createElement(
            "span",
            { className: `avatar-fallback ${className || ""}`, ...props },
            children,
          ),
      },
    },
  });

  const dropdownMenuModule = {
    DropdownMenu: ({ children, ...props }) =>
      React.createElement(
        "div",
        { "data-slot": "dropdown-menu", ...props },
        children,
      ),
    DropdownMenuTrigger: ({ children, ...props }) =>
      React.createElement(
        "button",
        { "data-slot": "dropdown-menu-trigger", ...props },
        children,
      ),
    DropdownMenuContent: ({ children, ...props }) => {
      const {
        sideOffset: _so,
        align: _al,
        side: _si,
        alignOffset: _ao,
        ...rest
      } = props;
      void _so;
      void _al;
      void _si;
      void _ao;
      return React.createElement(
        "div",
        { "data-slot": "dropdown-menu-content", ...rest },
        children,
      );
    },
    DropdownMenuGroup: ({ children, ...props }) =>
      React.createElement(
        "div",
        { "data-slot": "dropdown-menu-group", ...props },
        children,
      ),
    DropdownMenuItem: ({ children, render, ...props }) =>
      render
        ? React.cloneElement(render, props, children)
        : React.createElement(
            "div",
            { "data-slot": "dropdown-menu-item", ...props },
            children,
          ),
    DropdownMenuLabel: ({ children, ...props }) =>
      React.createElement(
        "div",
        { "data-slot": "dropdown-menu-label", ...props },
        children,
      ),
    DropdownMenuSeparator: (props) =>
      React.createElement("hr", {
        "data-slot": "dropdown-menu-separator",
        ...props,
      }),
  };

  const skeletonModule = {
    Skeleton: ({ className, ...props }) =>
      React.createElement("div", {
        "data-slot": "skeleton",
        className: `skeleton ${className || ""}`,
        ...props,
      }),
  };

  const authNav = loadModule("../components/site-header-auth.tsx", {
    "@/lib/auth/client": {
      authClient: {
        useSession: () => sessionState,
        signOut: async () => ({}),
      },
    },
    "@/components/ui/button": { ...buttonModule, Button: "button" },
    "@/components/ui/avatar": avatarModule,
    "@/components/ui/dropdown-menu": dropdownMenuModule,
    "@/components/ui/skeleton": skeletonModule,
  });

  const withOwner = (Component) =>
    function OwnedHeader(props) {
      return authNav.HeaderAuthProvider
        ? React.createElement(
            authNav.HeaderAuthProvider,
            null,
            React.createElement(Component, props),
          )
        : React.createElement(Component, props);
    };
  const HeaderDesktopAuth = withOwner(authNav.HeaderDesktopAuth);
  const HeaderMobileAuth = withOwner(authNav.HeaderMobileAuth);

  await t.test(
    "A definitive anonymous session overrides stale server identity",
    () => {
      sessionState = { data: null, isPending: false };
      for (const Component of [HeaderDesktopAuth, HeaderMobileAuth]) {
        const html = ReactDOMServer.renderToString(
          React.createElement(Component, {
            signInLabel: "Sign in",
            signUpLabel: "Sign up",
            workspaceLabel: "Workspace",
            initialUser: {
              name: "Previous account",
              email: "previous@example.com",
            },
          }),
        );
        assert.ok(
          !html.includes("Previous account") &&
            !html.includes("previous@example.com"),
        );
        assert.ok(html.includes("Sign in"));
      }
    },
  );

  await t.test(
    "Pending session: shows skeleton placeholder while loading auth state",
    () => {
      sessionState = { data: null, isPending: true };

      const desktopHtml = ReactDOMServer.renderToString(
        React.createElement(HeaderDesktopAuth, {
          signInLabel: "Sign in",
          signUpLabel: "Sign up",
          workspaceLabel: "Workspace",
        }),
      );
      assert.ok(
        desktopHtml.includes("skeleton"),
        "Desktop must show skeleton while session is pending",
      );
      assert.ok(
        desktopHtml.includes("rounded-full"),
        "Desktop photo skeleton must be circle (rounded-full)",
      );
      assert.ok(
        !desktopHtml.includes("Sign in"),
        "Desktop must NOT show Sign in while pending",
      );
      assert.ok(
        !desktopHtml.includes("Workspace"),
        "Desktop must NOT show Workspace while pending",
      );

      const mobileHtml = ReactDOMServer.renderToString(
        React.createElement(HeaderMobileAuth, {
          signInLabel: "Sign in",
          signUpLabel: "Sign up",
          workspaceLabel: "Workspace",
        }),
      );
      assert.ok(
        mobileHtml.includes("skeleton"),
        "Mobile must show skeleton while session is pending",
      );
      assert.ok(
        mobileHtml.includes("rounded-full"),
        "Mobile photo skeleton must be circle (rounded-full)",
      );
      assert.ok(
        !mobileHtml.includes("Sign in"),
        "Mobile must NOT show Sign in while pending",
      );
    },
  );

  await t.test(
    "Unauthenticated: shows Sign in and Sign up buttons, hides avatar and workspace",
    () => {
      sessionState = { data: null };

      const desktopHtml = ReactDOMServer.renderToString(
        React.createElement(HeaderDesktopAuth, {
          signInLabel: "Sign in",
          signUpLabel: "Sign up",
          workspaceLabel: "Workspace",
        }),
      );
      assert.ok(desktopHtml.includes("Sign in"), "Desktop must show Sign in");
      assert.ok(desktopHtml.includes("Sign up"), "Desktop must show Sign up");
      assert.ok(
        !desktopHtml.includes("Workspace"),
        "Desktop must NOT show Workspace when unauthenticated",
      );
      assert.ok(
        !desktopHtml.includes("avatar-img"),
        "Desktop must NOT show avatar when unauthenticated",
      );

      const mobileHtml = ReactDOMServer.renderToString(
        React.createElement(HeaderMobileAuth, {
          signInLabel: "Sign in",
          signUpLabel: "Sign up",
          workspaceLabel: "Workspace",
        }),
      );
      assert.ok(mobileHtml.includes("Sign in"), "Mobile must show Sign in");
      assert.ok(mobileHtml.includes("Sign up"), "Mobile must show Sign up");
      assert.ok(
        !mobileHtml.includes("Workspace"),
        "Mobile must NOT show Workspace when unauthenticated",
      );
    },
  );

  await t.test(
    "Authenticated via Email (no avatar): shows Workspace button to /app, hides Sign buttons and avatar",
    () => {
      sessionState = {
        data: {
          user: {
            id: "user-1",
            name: "Email User",
            email: "email@example.com",
            image: null,
          },
        },
      };

      const desktopHtml = ReactDOMServer.renderToString(
        React.createElement(HeaderDesktopAuth, {
          signInLabel: "Sign in",
          signUpLabel: "Sign up",
          workspaceLabel: "Workspace",
        }),
      );
      assert.ok(
        !desktopHtml.includes("Sign in"),
        "Sign buttons must disappear after login",
      );
      assert.ok(
        !desktopHtml.includes("Sign up"),
        "Sign buttons must disappear after login",
      );
      assert.ok(
        desktopHtml.includes("Workspace"),
        "Workspace button must appear",
      );
      assert.ok(
        desktopHtml.includes('href="/app"'),
        "Workspace button must link to /app",
      );
      assert.ok(
        !desktopHtml.includes("avatar-img"),
        "Avatar must NOT appear if email login (no social image)",
      );

      const mobileHtml = ReactDOMServer.renderToString(
        React.createElement(HeaderMobileAuth, {
          signInLabel: "Sign in",
          signUpLabel: "Sign up",
          workspaceLabel: "Workspace",
        }),
      );
      assert.ok(
        !mobileHtml.includes("Sign in"),
        "Mobile Sign buttons must disappear after login",
      );
      assert.ok(
        !mobileHtml.includes("Sign up"),
        "Mobile Sign buttons must disappear after login",
      );
      assert.ok(
        mobileHtml.includes("Workspace"),
        "Mobile Workspace button must appear",
      );
      assert.ok(
        mobileHtml.includes('href="/app"'),
        "Mobile Workspace button must link to /app",
      );
      assert.ok(
        !mobileHtml.includes("avatar-img"),
        "Mobile avatar must NOT appear if email login",
      );
    },
  );

  await t.test(
    "Authenticated via Social login (has avatar image): shows avatar and Workspace button, hides Sign buttons",
    () => {
      const avatarUrl =
        "https://lh3.googleusercontent.com/a/synthetic-social-avatar.jpg";
      sessionState = {
        data: {
          user: {
            id: "user-2",
            name: "Social User",
            email: "social@example.com",
            image: avatarUrl,
          },
        },
      };

      const desktopHtml = ReactDOMServer.renderToString(
        React.createElement(HeaderDesktopAuth, {
          signInLabel: "Sign in",
          signUpLabel: "Sign up",
          workspaceLabel: "Workspace",
        }),
      );
      assert.ok(
        !desktopHtml.includes("Sign in"),
        "Sign buttons must disappear",
      );
      assert.ok(
        !desktopHtml.includes("Sign up"),
        "Sign buttons must disappear",
      );
      assert.ok(
        desktopHtml.includes("Workspace"),
        "Workspace button must appear",
      );
      assert.ok(
        desktopHtml.includes('href="/app"'),
        "Workspace button must link to /app",
      );
      assert.ok(
        desktopHtml.includes(avatarUrl),
        "User avatar must appear if used social login",
      );
      assert.ok(
        desktopHtml.includes("dropdown-menu-trigger"),
        "User avatar must be wrapped in a dropdown menu trigger",
      );
      assert.ok(
        desktopHtml.includes("Sign out"),
        "Desktop dropdown menu must contain sign out option",
      );

      const mobileHtml = ReactDOMServer.renderToString(
        React.createElement(HeaderMobileAuth, {
          signInLabel: "Sign in",
          signUpLabel: "Sign up",
          workspaceLabel: "Workspace",
        }),
      );
      assert.ok(
        !mobileHtml.includes("Sign in"),
        "Mobile Sign buttons must disappear",
      );
      assert.ok(
        !mobileHtml.includes("Sign up"),
        "Mobile Sign buttons must disappear",
      );
      assert.ok(
        mobileHtml.includes("Workspace"),
        "Mobile Workspace button must appear",
      );
      assert.ok(
        mobileHtml.includes(avatarUrl),
        "Mobile user avatar must appear if used social login",
      );
      assert.ok(
        mobileHtml.includes("Sign out"),
        "Mobile view must show Sign out button when authenticated",
      );
    },
  );
});

function interactionHeader(signOutResult) {
  const state = [];
  let index = 0;
  let context;
  const navigation = [];
  const hooks = {
    ...React,
    useState(initial) {
      const i = index++;
      if (!(i in state)) state[i] = initial;
      return [
        state[i],
        (value) => {
          state[i] = value;
        },
      ];
    },
    useRef(initial) {
      const i = index++;
      if (!(i in state)) state[i] = { current: initial };
      return state[i];
    },
    useEffect() {},
    useContext: () => context,
  };
  const headerModule = loadModule("../components/site-header-auth.tsx", {
    react: hooks,
    "next/navigation": {
      useRouter: () => ({ push: (url) => navigation.push(url), refresh() {} }),
    },
    "@/lib/auth/client": {
      authClient: {
        useSession: () => ({
          data: { user: { name: "Private account" } },
          isPending: false,
        }),
        signOut: signOutResult,
      },
    },
    "@/components/ui/button": {
      Button: "button",
      buttonVariants: () => "button",
    },
    "@/components/ui/avatar": {
      Avatar: "div",
      AvatarImage: "img",
      AvatarFallback: "span",
    },
    "@/components/ui/skeleton": { Skeleton: "div" },
    "@/components/ui/dropdown-menu": Object.fromEntries(
      [
        "DropdownMenu",
        "DropdownMenuTrigger",
        "DropdownMenuContent",
        "DropdownMenuGroup",
        "DropdownMenuItem",
        "DropdownMenuSeparator",
      ].map((key) => [key, key]),
    ),
  });
  function render(variant) {
    index = 0;
    if (headerModule.HeaderAuthProvider)
      context = headerModule.HeaderAuthProvider({ children: null }).props.value;
    return headerModule[variant]({
      signInLabel: "Sign in",
      signUpLabel: "Sign up",
      workspaceLabel: "Workspace",
      signOutLabel: "Sign out",
    });
  }
  function elements(node) {
    if (!React.isValidElement(node)) return [];
    if (typeof node.type === "function") return elements(node.type(node.props));
    return [
      node,
      ...React.Children.toArray(node.props.children).flatMap(elements),
    ];
  }
  return { render, elements, navigation };
}

for (const variant of ["HeaderDesktopAuth", "HeaderMobileAuth"]) {
  test(`${variant}: bounds a lost sign-out reply with the SDK request timeout`, async () => {
    let options;
    const h = interactionHeader(async (input) => {
      options = input;
      return { error: { message: "Unconfirmed" } };
    });
    await h
      .elements(h.render(variant))
      .find((el) => el.props.onClick)
      .props.onClick();
    assert.ok(
      options?.fetchOptions?.timeout > 0 &&
        options.fetchOptions.timeout <= 15000,
    );
    assert.deepEqual(h.navigation, []);
  });
  for (const [outcome, response] of [
    ["returned error", async () => ({ error: { message: "Provider detail" } })],
    [
      "thrown failure",
      async () => {
        throw new Error("Provider detail");
      },
    ],
    ["missing acknowledgement", async () => undefined],
  ]) {
    test(`${variant}: ${outcome} conceals identity, permits retry and never navigates`, async () => {
      const h = interactionHeader(response);
      const signOut = h
        .elements(h.render(variant))
        .find((el) => el.props.onClick);
      await signOut.props.onClick();
      assert.deepEqual(h.navigation, []);
      const after = h.elements(h.render(variant));
      assert.ok(!after.some((el) => el.props.children === "Private account"));
      assert.ok(
        after.some((el) => el.props.onClick),
        "Uncertain sign-out must offer retry",
      );
      const other = h.elements(
        h.render(
          variant === "HeaderDesktopAuth"
            ? "HeaderMobileAuth"
            : "HeaderDesktopAuth",
        ),
      );
      assert.ok(
        !other.some((el) => el.props.children === "Private account"),
        "Resizing must not restore uncertain identity",
      );
    });
  }
  test(`${variant}: concurrent clicks dispatch once and navigate on confirmed success`, async () => {
    let finish;
    let calls = 0;
    const h = interactionHeader(() => {
      calls++;
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    const click = h.elements(h.render(variant)).find((el) => el.props.onClick)
      .props.onClick;
    const first = click();
    const second = click();
    assert.equal(calls, 1);
    assert.deepEqual(h.navigation, []);
    finish({ data: { success: true }, error: null });
    await Promise.all([first, second]);
    assert.deepEqual(h.navigation, ["/"]);
  });
}
