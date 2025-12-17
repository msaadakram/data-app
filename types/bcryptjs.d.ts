declare module "bcryptjs" {
  interface BcryptJS {
    hash(
      data: string | Buffer,
      saltOrRounds: number | string
    ): Promise<string>;
    
    hashSync(
      data: string | Buffer,
      saltOrRounds: number | string
    ): string;
    
    compare(
      data: string | Buffer,
      encrypted: string
    ): Promise<boolean>;
    
    compareSync(
      data: string | Buffer,
      encrypted: string
    ): boolean;
    
    genSalt(rounds?: number): Promise<string>;
    genSaltSync(rounds?: number): string;
    getRounds(hash: string): number;
  }
  
  const bcryptjs: BcryptJS;
  export default bcryptjs;
}

