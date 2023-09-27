cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0042 NEW)
set (CMAKE_CXX_STANDARD 17)

project(node-supernode)
add_definitions(-DCMAKE_BUILD)
include_directories(${CMAKE_JS_INC} thirdparty/n2n/include)
if(DEFINED WIN32)
  include_directories(thirdparty/n2n/win32)
endif(DEFINED WIN32)

add_subdirectory(thirdparty/n2n)

aux_source_directory(src SOURCE_FILES)

add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} n2n ${CMAKE_JS_LIB})

execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )

string(REGEX REPLACE "[\r\n\"]" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
message(STATUS ${NODE_ADDON_API_DIR})

target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR})

# macOS Big Sur or higher
if(CMAKE_HOST_SYSTEM_NAME STREQUAL "Darwin" AND CMAKE_HOST_SYSTEM_VERSION VERSION_GREATER_EQUAL "20.0")
  target_link_directories(${PROJECT_NAME} PRIVATE "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/lib")
endif()

add_definitions(-DNAPI_VERSION=8)
