export function isInstalledDisplay({
  standalone,
  fullscreen,
  javascriptFullscreen,
  iosStandalone,
}: {
  standalone: boolean
  fullscreen: boolean
  javascriptFullscreen: boolean
  iosStandalone: boolean
}) {
  return standalone || iosStandalone || (fullscreen && !javascriptFullscreen)
}
