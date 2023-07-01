# Paperstack

Paperstack is a simple, robust static site generator. It uses a new templating language called Stencil. Stencil is based on components rather than partials, blocks or includes that other templating langauges uses.

In it's current state Paperstack can turn `.stencil` files into `.html` files and copy static assets into the `Output` directory.

The plan is to make Paperstack a 'batteries-included' static site generator. In the [Roadmap](#roadmap) section you can read about the immediate plans.

*Note: I'm still experimenting with Paperstack and it's currently far from being stable.*

## Getting started

Make sure you have `node@20.1` or higher installed.

Run `npx create @paperstack/starter my-site`. This will create a new project in the `my-site` directory.

Then run `cd my-site && npm run dev` to start a local development server.

## Pages

Paperstack turns `.stencil` files in the `Pages` directory into `.html` files. `Pages/Index.stencil` will be compiled into `Output/index.html`.

The `Pages` directory can also contain folders with `.stencil` files inside them. `Pages/Articles/Index.html` will be compiled to `Output/articles/index.html`.

The file name is used to generate the path to the `.html` file. `Pages/Articles/HowToBuildAWebsite.stencil` will be compiled into `Output/articles/how-to-build-a-website/index.html`.

## Components

Components are similar to components in Vue or React except they are static. That means they don't contain any state or reactivity and they are compiled at build time.

Components can be used to create re-usable layouts, UI elements or partials.

### Defining components

Components are defined in the `Components` directory. You can also nest components in folders inside the `Components` directory.

Note: Component names are unique across the project. That means you can't have a `Components/Dark/Button.stencil` and a `Components/Light/Button.stencil`

### Using components

A component is always globally available to use in pages and other components. No need to import them anywhere.

Even though a component is defined in a nested folder it's available by the component name. That means `Components/Nested/Button` is available as `Button`.

Components always have uppercase names. That way it's possible to distinguish from normal html elements.

```
<Button>
    This is using a component
<Button>

<button>
    This is using a regular html element
<button>
```

### Slots

When defining a component it's possible to defined a `slot` where anything passed into the component will be printed:

```
// Components/Button.stencil
<button class="button">
    <slot />
</button>
```

The component can be used like this:

```
<Button>
    Click me
<Button>
```

And it will compile to this:

```
<button class="button">
    Click me
</button>
```

### Attributes

When using a component you can pass in attributes which will be available as variables inside the component:

```
// Pages/Index.stencil
<Button variant="primary">
    Click me
<Button>

// Components/Button.stencil
<button class="button-{{ variant }}">
    <slot />
</button>

// Output
<button class="button-primary">
    Click me
</button>
```

Any attributes that are not explicity used inside the component will be applied to the root element:

```
// Pages/Index.stencil
<Button id="delete-button">
    Click me
<Button>

// Components/Button.stencil
<button class="button">
    <slot />
</button>

// Output
<button class="button" id="delete-button">
    Click me
</button>
```

Attributes passed in will override attributes on the root element:

```
// Pages/Index.stencil
<Button class="custom-button">
    Click me
<Button>

// Components/Button.stencil
<button class="button">
    <slot />
</button>

// Output
<button class="custom-button">
    Click me
</button>
```

You can manually merge attributes passed in with attributes on the root element:

```
// Pages/Index.stencil
<Button class="mt-4">
    Click me
<Button>

// Components/Button.stencil
<button class="button {{ class }}">
    <slot />
</button>

// Output
<button class="button mt-4">
    Click me
</button>
```

### Expressions

Anything inside brackets (`{{` and `}}`) are expressions.

The most common use case is to print a variable:

```
{{ identifier }}
```

You can do math:

```
{{ 1 + 2 * 3 / 4 }}
```

You can do greater than/less than:

```
{{ 1 less than 2 }}

{{ 2 less than or equals 2 }}

{{ 2 greater than 1 }}

{{ 2 greater than or equals 2 }}
```

You can do and/or logic:

```
{{ identifier1 and identifier2 }}

{{ identifier or 'default value' }}
```

You can group subexpressions:

```
{{ (1 + 2) * 3 / 4 }}
```

You can use equals/not equals operators:

```
{{ identifier equals 'blue' }}

{{ identifier not equals 'blue' }}
```

You can use if/else:

```
{{ if identifier equals 'blue' then 'bg-blue-500' else 'bg-gray-500' }}
```

## Assets

The `Assets` directory can be used to add static files to the site. All files in the `Assets` directory will be copied into the `Output` folder when you build the site.

Files are copied recursively so `Assets/css/style.css` will be available at `/css/style.css`.

## Deployments

You can host a Paperstack site anywhere you would host any other static site. The build command creates a folder called `Output` that contains `.html` files and all your assets. Netlify or Vercel offer free hosting for simple static sites.

The configration depends on the host you choose, but the following steps should apply everywhere:

1. Use `npm run build` as the build command
2. Use `Output` as the publish directory.

## Examples

My personal website is build with Paperstack: [https://bjornlindholm.com/](https://bjornlindholm.com/)

You can check out the repo here: [https://github.com/BjornDCode/bjornlindholm.com](https://github.com/BjornDCode/bjornlindholm.com)

## Roadmap

These are some of the most urgent issues and improvements:

- [ ] Editor plugins
- [ ] [Elm-like errors](https://github.com/paperstackink/paperstack/issues/1)
- [ ] [`@if` directive](https://github.com/paperstackink/stencil/issues/2)
- [ ] [`@each` directive](https://github.com/paperstackink/stencil/issues/5)
- [ ] [Global `pages` variable](https://github.com/paperstackink/stencil/issues/6)
- [ ] [Markdown pages](https://github.com/paperstackink/paperstack/issues/2)
- [ ] [CSS processing](https://github.com/paperstackink/paperstack/issues/7)
