To recompile the library and then reinstall it in your demo application, you can follow these steps:

### 1. Build the library:

Navigate to your workspace root and execute:

```bash
ng build image-multicropper
```

This will rebuild the `image-multicropper` library.

### 2. Linking the Library for Local Development:

The best way to test your library inside an application within the same workspace is to make use of `npm link`. This command will create a symbolic link for your library in the global node modules, making it easy to test it within local projects.

Execute the following commands:

```bash
# Navigate to the built library's directory
cd dist/image-multicropper

# Create a global link
npm link
```

### 3. Link to the Application:

Now, navigate to your application's directory and link the library:

```bash
cd path/to/demo
npm link image-multicropper
```

Your demo application will now use the latest version of the `image-multicropper` library that you built and linked.

### 4. Run the demo application:

From the workspace root:

```bash
ng serve demo
```

As you make further changes to the library, you would simply repeat this process to test the latest version in your demo application. Once you're satisfied with your library's functionality, you can then consider publishing it to npm or another package manager for easier integration into other projects.