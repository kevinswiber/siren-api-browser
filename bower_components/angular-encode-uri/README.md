# angular-encode-uri

> Encode URIs through a filter.

[![Build Status](https://travis-ci.org/rubenv/angular-encode-uri.png?branch=master)](https://travis-ci.org/rubenv/angular-encode-uri)

## Usage
Add angular-encode-uri to your project:

```
bower install --save angular-encode-uri
```

Add it to your HTML file:

```html
<script src="bower_components/angular-encode-uri/dist/angular-encode-uri.min.js"></script>
```

Reference it as a dependency for your app module:

```js
angular.module('myApp', ['rt.encodeuri']);
```

Use it in your views:

```
Encode: {{myVar|encodeUri}}
```

## License 

    (The MIT License)

    Copyright (C) 2014 by Ruben Vermeersch <ruben@rocketeer.be>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
