{ pkgs, ... }:

{
  # https://devenv.sh/basics/
  env.GREET = "Bmg documentation website";

  # https://devenv.sh/packages/
  packages = [
  ];

  # https://devenv.sh/scripts/
  scripts = {
    hello.exec = "echo Hello from $GREET";
  };

  enterShell = ''
    hello
    devenv version
    echo pnpm: $(pnpm --version)
  '';

  # https://devenv.sh/languages/
  # languages.nix.enable = true;
  languages = {
    typescript.enable = true;
    javascript.enable = true;
    javascript.package = pkgs.nodejs_22;
    javascript.corepack.enable = true;
  };

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";

  # See full reference at https://devenv.sh/reference/options/
}
