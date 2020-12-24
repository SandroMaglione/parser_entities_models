# Parser Entities/Models Flutter
<p>
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" />
  <a href="https://github.com/SandroMaglione">
    <img alt="GitHub: SandroMaglione" src="https://img.shields.io/github/followers/SandroMaglione?label=Follow&style=social" target="_blank" />
  </a>
  <a href="https://twitter.com/SandroMaglione">
    <img alt="Twitter: SandroMaglione" src="https://img.shields.io/twitter/follow/SandroMaglione.svg?style=social" target="_blank" />
  </a>
</p>
Parser written with [Ohm](https://github.com/harc/ohm) which converts a definition file to models and entities classes `.dart` for Flutter projects.

***

## How to use
1. Write the source files inside the `sources` folder
2. `npm run start`
3. The file will be generated inside a new `dist` folder

## How it works
The `sources` folder contains the definition of the classes to generate. Each folder created inside `sources` will be created with the same name inside the generated `dist` folder.

Create a new folder inside `sources` and write a `.txt` file that defines the class to generate.

Finally, run the script:
```shell
npm run start
```
All the files will be generated inside a newly created `dist` folder. The files are then separated in an `entities` and `models` folders. Copy-Paste them in your Flutter project.

***

## Grammar
All the example are available in the `sources/example` folder. Just run `npm run start` to generate the `.dart` files.

### Class definition
Wrap classes definition inside braces, then write the name of the class **capitalized** and in **`pascalCase`**, and write the parameters inside curly braces:
```
(
    NameOfClass {
        ...
    }
)
```

### Parameter (only entity)
Each parameter defines a required **name** and a **type** for the entity, with **`:`** in between them and closed by a **`;`**. In this case, the model will have the same name and type.
```
(
    OnlyEntity {
        id: int;
    }
)
```
```dart
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

abstract class OnlyEntity extends Equatable {
  const OnlyEntity();

  int get id;

  @override
  List<Object> get props => [];
}
```
```dart
import 'package:dartz/dartz.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:meta/meta.dart';

part 'only_entity_model.g.dart';

@JsonSerializable()
class OnlyEntityModel extends OnlyEntity {
  @override
  final int id;

  const OnlyEntityModel({
    @required this.id,
  });

  factory OnlyEntityModel.fromJson(Map<String, dynamic> json) =>
      _$OnlyEntityModelFromJson(json);
  Map<String, dynamic> toJson() => _$OnlyEntityModelToJson(this);

}
```

### Entity Equatable props
Add **`*`** as prefix to the entity name to add the parameter to the `props` list of Equatable.
```
(
    WithProps {
        *id: int;
    }
)
```
```dart
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

abstract class WithProps extends Equatable {
  const WithProps();

  int get id;

  @override
  List<Object> get props => [id,];
}
```
```dart
import 'package:dartz/dartz.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:meta/meta.dart';

part 'with_props_model.g.dart';

@JsonSerializable()
class WithPropsModel extends WithProps {
  @override
  final int id;

  const WithPropsModel({
    @required this.id,
  });

  factory WithPropsModel.fromJson(Map<String, dynamic> json) =>
      _$WithPropsModelFromJson(json);
  Map<String, dynamic> toJson() => _$WithPropsModelToJson(this);

}
```

### Parameter (entity+model)
To define a different name and/or type for the model, add a **`,`** after the entity name and use the same formalism as before to define the model name and (optionally) the model type. In this case, the model will have a different name and, in case of different type, the user must define an implementation to convert the parameter of the model to the parameter of the entity.
```
(
    EntityModel {
        isFeatured: bool, featured: int;
    }
)
```
```dart
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

abstract class EntityModel extends Equatable {
  const EntityModel();

  bool get isFeatured;

  @override
  List<Object> get props => [];
}
```
```dart
import 'package:dartz/dartz.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:meta/meta.dart';

part 'entity_model_model.g.dart';

@JsonSerializable()
class EntityModelModel extends EntityModel {
  final int featured;

  const EntityModelModel({
    @required this.featured,
  });

  factory EntityModelModel.fromJson(Map<String, dynamic> json) =>
      _$EntityModelModelFromJson(json);
  Map<String, dynamic> toJson() => _$EntityModelModelToJson(this);

  @override
  bool get isFeatured => null /* TODO: featured */;
}
```

### Optional parameter
Add **`?`** after the entity name to make the parameter optional. In this case, an `-Option` suffix will be added to the entity name and the entity type will be `Option<T>`. The model will override the entity parameter by using `optionOf()`.
```
(
    Optional {
        name?: String;
    }
)
```
```dart
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

abstract class Optional extends Equatable {
  const Optional();

  Option<String> get nameOption;

  @override
  List<Object> get props => [];
}
```
```dart
import 'package:dartz/dartz.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:meta/meta.dart';

part 'optional_model.g.dart';

@JsonSerializable()
class OptionalModel extends Optional {
  final String name;

  const OptionalModel({
    this.name,
  });

  factory OptionalModel.fromJson(Map<String, dynamic> json) =>
      _$OptionalModelFromJson(json);
  Map<String, dynamic> toJson() => _$OptionalModelToJson(this);

  @override
  Option<String> get nameOption => optionOf(name);
}
```

### Parameters list
Add **`!`** after the entity name to make the parameter a list. In this case, an `-List` suffix will be added to the entity name and the entity type will be `IList<T>`. The model will override the entity parameter by using `ilist()`.
```
(
    ListParams {
        address!: String;
    }
)
```
```dart
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

abstract class ListParams extends Equatable {
  const ListParams();

  IList<String> get addressList;

  @override
  List<Object> get props => [];
}
```
```dart
import 'package:dartz/dartz.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:meta/meta.dart';

part 'list_params_model.g.dart';

@JsonSerializable()
class ListParamsModel extends ListParams {
  final List<String> address;

  const ListParamsModel({
    @required this.address,
  });

  factory ListParamsModel.fromJson(Map<String, dynamic> json) =>
      _$ListParamsModelFromJson(json);
  Map<String, dynamic> toJson() => _$ListParamsModelToJson(this);

  @override
  IList<String> get addressList => ilist(address);
}
```

### Nesting classes
Classes can be nested as many time as needed. To generate a nested class just **make the entity type a class definition**. The entity will have the type of the nested class and the nested class itself will be generated in a separate file.
```
(
    Nested {
        subClass: (
            SubClass {
                id: int;
            }
        );
    }
)
```
```dart
/// Source class
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

abstract class Nested extends Equatable {
  const Nested();

  SubClass get subClass;

  @override
  List<Object> get props => [];
}

/// Sub class (in separate file)
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

abstract class SubClass extends Equatable {
  const SubClass();

  int get id;

  @override
  List<Object> get props => [];
}
```
```dart
/// Source class
import 'package:dartz/dartz.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:meta/meta.dart';

part 'nested_model.g.dart';

@JsonSerializable()
class NestedModel extends Nested {
  @override
  final SubClassModel subClass;

  const NestedModel({
    @required this.subClass,
  });

  factory NestedModel.fromJson(Map<String, dynamic> json) =>
      _$NestedModelFromJson(json);
  Map<String, dynamic> toJson() => _$NestedModelToJson(this);

}

/// Sub class (in separate file)
import 'package:dartz/dartz.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:meta/meta.dart';

part 'sub_class_model.g.dart';

@JsonSerializable()
class SubClassModel extends SubClass {
  @override
  final int id;

  const SubClassModel({
    @required this.id,
  });

  factory SubClassModel.fromJson(Map<String, dynamic> json) =>
      _$SubClassModelFromJson(json);
  Map<String, dynamic> toJson() => _$SubClassModelToJson(this);

}
```

### Complete example
The following example shows all the possible cases currently supported by the compiler.
```
(
    Complete {
        onlyE: int;
        onlyEOpt?: int;
        onlyELst!: int;
        mOnlyName: int, m_only_name;
        mOnlyNameOpt?: int, m_only_name_opt;
        mOnlyNameLst!: int, m_only_name_lst;
        mType: int, m_type: String;
        mTypeOpt?: int, m_type_opt: String;
        mTypeLst!: int, m_type_lst: String;
        onlyESub: (Sub{id:int;});
        onlyESubOpt?: (Sub{id:int;});
        onlyESubLst!: (Sub{id:int;});
        mOnlyNameSub: (Sub{id:int;}), m_only_name_sub;
        mOnlyNameSubOpt?: (Sub{id:int;}), m_only_name_sub_opt;
        mOnlyNameSubLst!: (Sub{id:int;}), m_only_name_sub_lst;
        mTypeSub: (Sub{id:int;}), m_type_sub: String;
        mTypeSubOpt?: (Sub{id:int;}), m_type_sub_opt: String;
        mTypeSubLst!: (Sub{id:int;}), m_type_sub_lst: String;
    }
)
```
```dart
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

abstract class Complete extends Equatable {
  const Complete();

  int get onlyE;
  Option<int> get onlyEOptOption;
  IList<int> get onlyELstList;
  int get mOnlyName;
  Option<int> get mOnlyNameOptOption;
  IList<int> get mOnlyNameLstList;
  int get mType;
  Option<int> get mTypeOptOption;
  IList<int> get mTypeLstList;
  Sub get onlyESub;
  Option<Sub> get onlyESubOptOption;
  IList<Sub> get onlyESubLstList;
  Sub get mOnlyNameSub;
  Option<Sub> get mOnlyNameSubOptOption;
  IList<Sub> get mOnlyNameSubLstList;
  Sub get mTypeSub;
  Option<Sub> get mTypeSubOptOption;
  IList<Sub> get mTypeSubLstList;

  @override
  List<Object> get props => [];
}
```
```dart
import 'package:dartz/dartz.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:meta/meta.dart';

part 'complete_model.g.dart';

@JsonSerializable()
class CompleteModel extends Complete {
  @override
  final int onlyE;
  @override
  final SubModel onlyESub;
  final int onlyEOpt;
  final List<int> onlyELst;
  final int m_only_name;
  final int m_only_name_opt;
  final List<int> m_only_name_lst;
  final String m_type;
  final String m_type_opt;
  final List<String> m_type_lst;
  final SubModel onlyESubOpt;
  final List<SubModel> onlyESubLst;
  final SubModel m_only_name_sub;
  final SubModel m_only_name_sub_opt;
  final List<SubModel> m_only_name_sub_lst;
  final String m_type_sub;
  final String m_type_sub_opt;
  final List<String> m_type_sub_lst;

  const CompleteModel({
    @required this.onlyE,
    @required this.onlyELst,
    @required this.m_only_name,
    @required this.m_only_name_lst,
    @required this.m_type,
    @required this.m_type_lst,
    @required this.onlyESub,
    @required this.onlyESubLst,
    @required this.m_only_name_sub,
    @required this.m_only_name_sub_lst,
    @required this.m_type_sub,
    @required this.m_type_sub_lst,
    this.onlyEOpt,
    this.m_only_name_opt,
    this.m_type_opt,
    this.onlyESubOpt,
    this.m_only_name_sub_opt,
    this.m_type_sub_opt,
  });

  factory CompleteModel.fromJson(Map<String, dynamic> json) =>
      _$CompleteModelFromJson(json);
  Map<String, dynamic> toJson() => _$CompleteModelToJson(this);

  @override
  Option<int> get onlyEOptOption => optionOf(onlyEOpt);

  @override
  IList<int> get onlyELstList => ilist(onlyELst);

  @override
  int get mOnlyName => m_only_name;

  @override
  Option<int> get mOnlyNameOptOption => optionOf(m_only_name_opt);

  @override
  IList<int> get mOnlyNameLstList => ilist(m_only_name_lst);

  @override
  int get mType => null /* TODO: m_type */;

  @override
  Option<int> get mTypeOptOption => optionOf(null /* TODO: m_type_opt */);

  @override
  IList<int> get mTypeLstList => ilist(null /* TODO: m_type_lst */);

  @override
  Option<Sub> get onlyESubOptOption => optionOf(onlyESubOpt);

  @override
  IList<Sub> get onlyESubLstList => ilist(onlyESubLst);

  @override
  Sub get mOnlyNameSub => m_only_name_sub;

  @override
  Option<Sub> get mOnlyNameSubOptOption => optionOf(m_only_name_sub_opt);

  @override
  IList<Sub> get mOnlyNameSubLstList => ilist(m_only_name_sub_lst);

  @override
  Sub get mTypeSub => null /* TODO: m_type_sub */;

  @override
  Option<Sub> get mTypeSubOptOption => optionOf(null /* TODO: m_type_sub_opt */);

  @override
  IList<Sub> get mTypeSubLstList => ilist(null /* TODO: m_type_sub_lst */);
}
```

## Releases
- 24 December 2020, 18:05 | Initial release