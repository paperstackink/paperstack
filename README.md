# Paperstack

Paperstack is a static site generator. It uses a new templating language called Stencil. Stencil is based on components rather than partials, blocks or includes that other templating langauges uses.

In it's current state Paperstack can turn `.stencil` files into `.html` files and copy static assets into the `Output` directory.

The plan is to make Paperstack a 'batteries-included' static site generator. In the [Roadmap](#roadmap) section you can read about the immediate plans.

_Note: I'm still experimenting with Paperstack and it's currently far from being stable. Any feedback is welcome!_

## Getting started

Make sure you have `node@20.1` or higher installed.

Run the following command:

```
git clone https://github.com/paperstackink/starter.git my-site
```

This will create a new project in the `my-site` directory.

Then run the following command to start a local server:

```
cd my-site
npm install
npm run dev
```

## Pages

Paperstack turns `.stencil` files in the `Pages` directory into `.html` files. `Pages/Index.stencil` will be compiled into `Output/index.html`.

The `Pages` directory can also contain folders with `.stencil` files inside them. `Pages/Articles/Index.html` will be compiled to `Output/articles/index.html`.

The file name is used to generate the path to the `.html` file. `Pages/Articles/HowToBuildAWebsite.stencil` will be compiled into `Output/articles/how-to-build-a-website/index.html`.

## Components

Components are similar to components in Vue or React except they are static. That means they don't contain any state or reactivity and they are compiled at build time.

Components can be used to create re-usable layouts, UI elements or partials.

### Defining components

Components are defined in the `Components` directory. You can also nest components in folders inside the `Components` directory.

Note: Component names are unique across the project. That means you can't have a `Components/Dark/Button.stencil` and a `Components/Light/Button.stencil`. Additionally components can't use the same name as any built-in components.

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

#### Binding attributes

You can assign all properties of a record as attributs on a node.

```
<Button #bind="$record">
    Click here
<Button>
```

This is especially useful when dynamically rendering components.

### Dynamic components

It's possible to dynamically render a component by using `Component` and giving it a component name.

```
<Component is="Card" />
```

It's also possible to dynamically determine the component name:

```
<Component is="{{ name }}" />
```

### Recursive components

You can use a component recursively.

```
// Components/List.stencil
<List>
    <ListItem>Item 1<ListItem>
    <ListItem>
        Item 2
        <List>
            <ListItem>Item 2.a<ListItem>
            <ListItem>Item 2.b<ListItem>
        </List>
    <ListItem>
</List>
```

Note: If you are rending the component dynamically it's important that you have a check in the component that will stop the recursion at some point. Otherwise you will run into an infinite loop.

### Directives

#### @if

You can conditionally add content with the `@if` directive:

```
<button>
    @if(variant equals "primary")
        <Icon name="Checkmark" />
    @endif

    <slot />
</button>
```

#### @each

You can loop over records with @each

```
@each(page, name in $pages)
    <a href="{{ page.path }}">{{ page.title }}</a>
@endeach
```

### Records

Records are key/value data types. It's not possible to define custom records but Paperstack provides a set of records.

You can access fields on records with dot notation:

```
{{ $pages.Index.path }}
```

#### Methods

Records have a set of methods to make them easier to work with.

##### sortBy

`sortBy` can be used to sort all items in a record based on a field. You can also determine whether it sorts in ascending or descending order.

```
$pages.Articles.pages.sortBy('date', 'desc')
```

Note: This example assumes you've added a `date` field to all articles using a `Data` component.

##### filterBy

`filterBy` can be used to remove properties from a record.

The first argument is the field to check.

The second argument is the operator. The valid operators are:

-   `equals`
-   `not equals`
-   `greater than`
-   `greater than or equals`
-   `less than`
-   `less than or equals`
-   `contains`
-   `truthy`
-   `not truthy`
-   `exists`
-   `not exists`

The third argument is a value to compare by if required by the operator.

```
$pages.Articles.pages.filterBy('title', 'exists')
```

#### $pages

`$pages` is a global record that contains all pages and directories in your project. It follows the same structure that is present in the `Pages` directory.

Each page has the same fields as the `$page` record.

Each directory has the following properties:

-   `pages`: A record of all pages directly nested in the directory
-   `directories`: A record of directories pages directly nested in the directory
-   `allPages`: A record of all pages in the directory including nested directores
-   `allDirectories`: A record of all directories in the directory including nested directores

It can be used to dynamically loop over pages to create menus, index pages etc.

#### $page

`$page` is a record that contains all information about the current page. It has the following structure:

```
- $page
    - isPage: true
    - isDirectory: false
    - name: <name of the file>
    - slug: <a sluggified version of the name>
    - path: <the absolute path to the page: /articles/how-to-build-a-website>
```

Additional fields can be added to the `$page` record with a `Data` component.

All the properties in `$page` are also available as global variables.

#### $data

A record of data added to a page with the `Data` component.

#### $attributes

A record of all attributes given to a component.

Note: This record is only available inside components.

### Built-in components

Paperstack provides some built-in components. Similar to custom components they are available without having to import them.

#### <Data />

The `Data` component can be used to add additional fields to a page via yaml. These fields can be accessed via the `$page` or `$pages` records.

```
<Data>
    title: How to make a website
    date: 2023-05-24
    featured: true
</Data>
```

Note: The `Data` component can only be used inside `.stencil` files in the `Pages` directory. You can't add a `Data` component inside a custom component.

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

## Debugging

The `dump()` method can be used to dump any variable so it can be expected. You can parse multiple variables to the method.

```
<div>
    {{ dump($pages) }}
</div>
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

-   [x] [`@if` directive](https://github.com/paperstackink/stencil/issues/2)
-   [x] [`@each` directive](https://github.com/paperstackink/stencil/issues/5)
-   [x] [Global `pages` variable](https://github.com/paperstackink/stencil/issues/6)
-   [ ] Editor plugins
-   [ ] [Elm-like errors](https://github.com/paperstackink/paperstack/issues/1)
-   [ ] [Markdown pages](https://github.com/paperstackink/paperstack/issues/2)
-   [ ] [CSS processing](https://github.com/paperstackink/paperstack/issues/7)
