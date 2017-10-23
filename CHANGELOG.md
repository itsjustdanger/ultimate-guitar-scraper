#### 0.4.0 (2017-10-23)

**Requires nodejs `>= 6.5`**

##### `search`

- `tabs` properties with `null`  are now  _undefined_

##### `get`

- `tab` properties with `null`  are now  _undefined_
- `tab` has property `url` String
- `tab` content is not an Object

| Property `type`    | Property `content`                  |
|--------------------|-------------------------------------|
| `tabs`             | `{ text: String, html: String}`     |
| `chords`           | `{ text: String, html: String}`     |
| `ukulele chords`   | `{ text: String, html: String}`     |
| `drum tabs`        | `{ text: String, html: String}`     |
| `bass tabs`        | `{ text: String, html: String}`     |
| `guitar pro tabs`  | `{ url: String }`                   |
| `power tabs`       | `{ url: String }`                   |
| `video lessons`    | `{ url: String }`                   |

##### `autocomplete`

- param is now a String of what you search instead of an Object.

##### test

Using JSON schema.


#### 0.3.0 (2015-11-30)
- add new feature `autocomplete`
- refactor `utils.js`
- add examples for `autocomplete`
- add/update specs

#### 0.2.0 (2015-11-24)
- extract code in `searchURL` that was formatting the query params in new method `formatQuery`
- better code in `parseTAB` so it parses more *TAB*
- rename `searchURL` for `generateURL`
- better doc
