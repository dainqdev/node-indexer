import cloneDeep from 'lodash/cloneDeep'

export interface ProxyMethods {
  free(): this is null;
}

export type Proxy<T extends Object, K extends keyof T = keyof T> = T extends {
  fee(): any;
}
  ? never
  : K extends "free"
  ? never
  : Readonly<T> & ProxyMethods;

class DataProxy<T extends Object> {
  #data: T;
  #cleanedUp = false;

  private constructor(data: T) {
    this.#data = data;
  }

  private get(key: string) {
    return this.#data[key as keyof T];
  }

  static from<T extends Object>(data: T) {
    return new Proxy(new DataProxy(data), {
      get(target, key: string) {
        if (target.#cleanedUp === true) {
          throw new Error("Data already cleanup");
        }
        
        if (key === 'free') {
          return target[key].bind(target)
        }

        return target.get(key);
      },
    }) as unknown as Proxy<T>;
  }

  public free(): this is null {
    if (typeof this.#data !== "object" && this.#data) {
      console.log("[WARN]: Data cleaned up is not object");
      return true;
    }

    if (this.#cleanedUp === true) {
      console.log("[WARN]: Data already cleaned up");
      return true;
    }

    cleanUpVariable(this.#data)

    //@ts-ignore
    this.#data = null;
    this.#cleanedUp = true;
    
    return true;
  }

  static clone<T>(value: T) {
    return cloneDeep(value)
  }
}

function cleanUpVariable<T extends Object>(data: T) {
  
  for (const key of Object.keys(data)) {
    if (typeof data[key as keyof T] === "object" && data[key as keyof T]) {
      cleanUpVariable(data[key as keyof T] as Object);
    } else {
      delete data[key as keyof T];
    }
  }
}

export default DataProxy