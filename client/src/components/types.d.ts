// Este archivo nos permite definir tipos personalizados (para las imagenes en este caso)
declare module '*.svg' {
    const content: string;
    export default content;
}
declare module '*.png' {
    const content: string;
    export default content;
}