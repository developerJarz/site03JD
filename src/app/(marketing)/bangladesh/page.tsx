// /bangladesh: the Bangladesh (Dhaka) market page, which is the growth proposal. Same page as /proposal,
// whose metadata is reused, so the canonical URL stays /proposal and search engines see one page.
export { default, generateMetadata } from "../proposal/page";

export const revalidate = 3600;
