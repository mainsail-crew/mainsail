/* eslint-disable @typescript-eslint/no-explicit-any */

export type IsAny<T> = unknown extends T ? ([keyof T] extends [never] ? false : true) : false

type ExcludeArrayKeys<T> = T extends ArrayLike<any> ? Exclude<keyof T, keyof any[]> : keyof T
type PathImpl<T, Key extends keyof T> = Key extends string
    ? IsAny<T[Key]> extends true
        ? never
        : T[Key] extends Record<string, any>
          ?
                | `${Key}.${PathImpl<T[Key], ExcludeArrayKeys<T[Key]>> & string}`
                | `${Key}.${ExcludeArrayKeys<T[Key]> & string}`
          : never
    : never
type PathImpl2<T> = PathImpl<T, keyof T> | keyof T

export type Path<T> = keyof T extends string
    ? PathImpl2<T> extends infer P
        ? P extends string | keyof T
            ? P
            : keyof T
        : keyof T
    : never

export type Choose<T extends Record<string | number, any>, K extends Path<T>> = K extends `${infer U}.${infer Rest}`
    ? Rest extends Path<T[U]>
        ? Choose<T[U], Rest>
        : never
    : T[K]

export type Json = string | number | boolean | null | { [property: string]: Json } | Json[]
