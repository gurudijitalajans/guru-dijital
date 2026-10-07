/* Panel giriş ekranı ve üst menü için marka görselleri. Panel kendi
   stillerini kullandığı için next/image yerine düz img yeterli. */
/* eslint-disable @next/next/no-img-element */

export function Logo() {
  return (
    <img
      src="/brand/logo-navy.svg"
      alt="Guru Dijital"
      width={190}
      height={83}
      className="guru-panel-logo"
    />
  );
}

export function Icon() {
  return <img src="/brand/mark-navy.svg" alt="" width={26} height={26} className="guru-panel-icon" />;
}
