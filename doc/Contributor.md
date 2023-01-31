# 贡献指南

[TOC]

## 构建环境

* git
* CMake >= 2.6
* 一个现代C++编译器，至少支持C++17（g++，clang，msvc都可）
* Windows用户需要安装Visual Studio，且安装Windows 10及以下版本的Windows SDK（在Visual Stuidio Installer中的`单个组件`搜索`Windows SDK`选择）
* NodeJS >= 16
* pnpm包管理器（自己用其他的也可以，但是不要把lock文件提交到仓库）
* Docker（可选，如果你要构建Docker镜像那就需要安装）

## 准备工作

1. 克隆项目`git clone https://github.com/ChingCdesu/supernode-server.git && cd supernode-server`
2. 获取依赖仓库`git submodule update --init`
3. 安装node包`pnpm install`
4. 启动开发服务器`pnpm run start:dev`

## 提示

* 路径的alias：
  * `@/`代替`src/`
  * `@native/`代替`native/`
* logger注入：将需要注入的类`extends LoggerProvider`即可`this.logger`即可使用

## TODOs

- [ ] 数据库选型和表设计
- [ ] 后端API设计和实现
- [ ] C++的log部分重定向到js

## 针对C++ node addon的开发和调试

* 如果vscode找不到头文件，可以在`.vscode`文件夹中添加`c_cpp_properties.json`文件，这个文件视操作系统，工具链而定，示例：

  ```json
  {
      "configurations": [
          {
              "name": "macOS",
              "includePath": [
                  "${workspaceFolder}/**",
                  "${workspaceFolder}/native/thirdparty/n2n/include",
                  "${HOME}/.cmake-js/node-x64/v18.13.0/include/node"
              ],
              "defines": ["CMAKE_BUILD"],
              "compilerPath": "/usr/bin/clang",
              "cStandard": "c17",
              "cppStandard": "c++17",
              "intelliSenseMode": "macos-clang-x64"
          }
      ],
      "version": 4
  }
  ```

* `.vscode/launch.json`和`.vscode/tasks.json`已在仓库上传，按照`.vscode/launch.json`中的注释安装对应的插件，然后按F5即可调试node.js和c++，不需要使用包管理器pnpm启动