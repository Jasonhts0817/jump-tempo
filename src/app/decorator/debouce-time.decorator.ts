export function Debounce(delay: number = 300): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const timeoutKey = Symbol();

        const original = descriptor.value;

        descriptor.value = function (...args: any) {
            clearTimeout((this as any)[timeoutKey]);
            (this as any)[timeoutKey] = setTimeout(() => original.apply(this, args), delay);
        };

        return descriptor;
    };
}