/**
 * @deprecated — this file has moved to `src/lib/api.ts`.
 *
 * It used to contain duplicated API call logic plus debug `alert()` and
 * `console.log` calls that fired on every page load. The canonical API
 * client is now `lib/api.ts`. This shim only exists so any latent imports
 * of `../api` keep working — please update them and delete this file.
 */

export {
  listThemes,
  getTheme,
  saveTheme as createTheme,
  saveTheme,
  deleteTheme,
  uploadLogo,
  themeCssUrl,
  themePreviewUrl,
  getApiBase,
  setApiBase,
} from './lib/api'
