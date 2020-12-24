const fs = require("fs");
const ohm = require("ohm-js");
const { toSnakeCase } = require("./utils");

const parser = (source, dir) => {
  var contents = fs.readFileSync("src/grammar.ohm");
  var grammar = ohm.grammar(contents);

  const match = grammar.match(source);
  if (match.succeeded()) {
    const sem = grammar.createSemantics();

    // Generate Equatable props (*)
    sem.addOperation("prop", {
      Params: (param, _) => param.prop().join(""),
      Param: (isProp, eName, extra, _, eType, __, mName, ___, mType) => {
        if (isProp.numChildren > 0) {
          const extraP = extra.sourceString;
          if (extraP == "?") {
            return `${eName.sourceString}Option,`;
          } else if (extraP == "!") {
            return `${eName.sourceString}List,`;
          } else {
            return `${eName.sourceString},`;
          }
        } else {
          return "";
        }
      },
    });

    // Extra only name from entity type
    sem.addOperation("typeNameEntity", {
      Entity: (p1, name, p2, params, p3, p4) => name.sourceString,
      S: (text) => text.sourceString,
    });

    // Extra only name from model type
    sem.addOperation("typeNameModel", {
      Entity: (p1, name, p2, params, p3, p4) => name.sourceString + "Model",
      S: (text) => text.sourceString,
    });

    // List of final params in model class
    sem.addOperation("modelParams", {
      Params: (param, _) => {
        const listParam = param.modelParams();
        listParam.sort((a, b) => {
          const c1 = a.includes("@override");
          const c2 = b.includes("@override");
          return c1 && c2 ? 0 : c1 ? -1 : 1;
        });
        return listParam.join("\n");
      },
      Param: (isProp, eName, extra, _, eType, __, mName, ___, mType) => {
        const extraP = extra.sourceString;
        if (mName.numChildren > 0) {
          if (mType.numChildren > 0 && mType.child(0).numChildren > 0) {
            if (extraP == "!") {
              return `  final List<${mType
                .child(0)
                .modelParams()}> ${mName.modelParams()};`;
            } else {
              return `  final ${mType
                .child(0)
                .modelParams()} ${mName.modelParams()};`;
            }
          } else {
            if (extraP == "!") {
              return `  final List<${eType.typeNameModel()}> ${mName.modelParams()};`;
            } else {
              return `  final ${eType.typeNameModel()} ${mName.modelParams()};`;
            }
          }
        } else {
          if (extraP == "?") {
            return `  final ${eType.typeNameModel()} ${eName.modelParams()};`;
          } else if (extraP == "!") {
            return `  final List<${eType.typeNameModel()}> ${eName.modelParams()};`;
          } else {
            return (
              `  @override\n` +
              `  final ${eType.typeNameModel()} ${eName.modelParams()};`
            );
          }
        }
      },
      Ucs: (firstLetter, text) => firstLetter.sourceString + text.modelParams(),
      Lcs: (firstLetter, text) => firstLetter.sourceString + text.modelParams(),
      S: (text) => text.sourceString,
    });

    // List of constructor params in model class
    sem.addOperation("modelConst", {
      Params: (param, _) => {
        const listParam = param.modelConst();
        listParam.sort((a, b) => {
          const c1 = a.includes("@required");
          const c2 = b.includes("@required");
          return c1 && c2 ? 0 : c1 ? -1 : 1;
        });
        return listParam.join("");
      },
      Param: (isProp, eName, extra, _, eType, __, mName, ___, mType) => {
        const extraP = extra.sourceString;
        if (mName.numChildren > 0) {
          if (extraP == "?") {
            return `    this.${mName.modelConst()},\n`;
          } else {
            return `    @required this.${mName.modelConst()},\n`;
          }
        } else {
          if (extraP == "?") {
            return `    this.${eName.modelConst()},\n`;
          } else {
            return `    @required this.${eName.modelConst()},\n`;
          }
        }
      },
      Ucs: (firstLetter, text) => firstLetter.sourceString + text.modelConst(),
      Lcs: (firstLetter, text) => firstLetter.sourceString + text.modelConst(),
      S: (text) => text.sourceString,
    });

    // List of overrides for model
    sem.addOperation("overrides", {
      Params: (param, _) =>
        param
          .overrides()
          .filter((v) => v !== "")
          .join("\n"),
      Param: (isProp, eName, extra, _, eType, __, mName, ___, mType) => {
        const extraP = extra.sourceString;
        if (mName.numChildren > 0) {
          if (mType.numChildren > 0 && mType.child(0).numChildren > 0) {
            if (extraP == "?") {
              return (
                `  @override\n` +
                `  Option<${eType.typeNameEntity()}> get ${eName.overrides()}Option => optionOf(null /* TODO: ${mName.overrides()} */);\n`
              );
            } else if (extraP == "!") {
              return (
                `  @override\n` +
                `  IList<${eType.typeNameEntity()}> get ${eName.overrides()}List => ilist(null /* TODO: ${mName.overrides()} */);\n`
              );
            } else {
              return (
                `  @override\n` +
                `  ${eType.typeNameEntity()} get ${eName.overrides()} => null /* TODO: ${mName.overrides()} */;\n`
              );
            }
          } else {
            if (extraP == "?") {
              return (
                `  @override\n` +
                `  Option<${eType.typeNameEntity()}> get ${eName.overrides()}Option => optionOf(${mName.overrides()});\n`
              );
            } else if (extraP == "!") {
              return (
                `  @override\n` +
                `  IList<${eType.typeNameEntity()}> get ${eName.overrides()}List => ilist(${mName.overrides()});\n`
              );
            } else {
              return (
                `  @override\n` +
                `  ${eType.typeNameEntity()} get ${eName.overrides()} => ${mName.overrides()};\n`
              );
            }
          }
        } else {
          if (extraP == "?") {
            return (
              `  @override\n` +
              `  Option<${eType.typeNameEntity()}> get ${eName.overrides()}Option => optionOf(${eName.overrides()});\n`
            );
          } else if (extraP == "!") {
            return (
              `  @override\n` +
              `  IList<${eType.typeNameEntity()}> get ${eName.overrides()}List => ilist(${eName.overrides()});\n`
            );
          } else {
            return "";
          }
        }
      },
      Ucs: (firstLetter, text) => firstLetter.sourceString + text.overrides(),
      Lcs: (firstLetter, text) => firstLetter.sourceString + text.overrides(),
      S: (text) => text.sourceString,
    });

    // Convert to model class
    sem.addOperation("toModel", {
      Entity(p1, name, p2, params, p3, p4) {
        const nameString = name.sourceString;
        const modelName = nameString + "Model";
        const fileName = toSnakeCase(name.sourceString) + "_model.dart";
        const gDart = toSnakeCase(nameString) + "_model.g.dart";
        return (
          `${fileName}\n` +
          `import 'package:dartz/dartz.dart';\n` +
          `import 'package:json_annotation/json_annotation.dart';\n` +
          `import 'package:meta/meta.dart';\n\n` +
          `part '${gDart}';\n\n` +
          `@JsonSerializable()\n` +
          `class ${modelName} extends ${nameString} {\n` +
          `${params.modelParams()}\n\n` +
          `  const ${modelName}({\n` +
          `${params.modelConst()}` +
          `  });\n\n` +
          `  factory ${modelName}.fromJson(Map<String, dynamic> json) =>\n` +
          `      _$${modelName}FromJson(json);\n` +
          `  Map<String, dynamic> toJson() => _$${modelName}ToJson(this);\n\n` +
          `${params.overrides()}` +
          `}`
        );
      },
    });

    // Convert to entity class
    sem.addOperation("toEntity", {
      Entity(p1, name, p2, params, p3, p4) {
        const nameString = name.sourceString;
        const fileName = toSnakeCase(name.sourceString) + ".dart";
        return (
          `${fileName}\n` +
          `import 'package:dartz/dartz.dart';\n` +
          `import 'package:equatable/equatable.dart';\n\n` +
          `abstract class ${nameString} extends Equatable {\n` +
          `  const ${nameString}();\n\n` +
          `${params.toEntity()}\n` +
          `  @override\n` +
          `  List<Object> get props => [${params.prop()}];\n` +
          `}`
        );
      },
      Params: (param, _) => param.toEntity().join(""),
      Param: (isProp, eName, extra, _, eType, __, mName, ___, mType) => {
        const extraP = extra.sourceString;
        if (extraP == "?") {
          return `  Option<${eType.typeNameEntity()}> get ${
            eName.sourceString
          }Option;\n`;
        } else if (extraP == "!") {
          return `  IList<${eType.typeNameEntity()}> get ${
            eName.sourceString
          }List;\n`;
        } else {
          return `  ${eType.typeNameEntity()} get ${eName.sourceString};\n`;
        }
      },
      Ucs: (firstLetter, text) => firstLetter.sourceString + text.toEntity(),
      Lcs: (firstLetter, text) => firstLetter.sourceString + text.toEntity(),
      S: (text) => text.sourceString,
    });

    // Convert to entity class a sub type
    sem.addOperation("toSubEntity", {
      Entity: (p1, name, p2, params, p3, p4) => params.toSubEntity(),
      Params: (param, _) =>
        param
          .toSubEntity()
          .filter((v) => v !== "")
          .join("---"),
      Param: (isProp, eName, extra, _, eType, __, mName, ___, mType) => {
        if (eType.sourceString.charAt(0) == "(") {
          return `${eType.toEntity()}---${eType.toSubEntity()}---`;
        } else {
          return "";
        }
      },
    });

    // Convert to model class a sub type
    sem.addOperation("toSubModel", {
      Entity: (p1, name, p2, params, p3, p4) => params.toSubModel(),
      Params: (param, _) =>
        param
          .toSubModel()
          .filter((v) => v !== "")
          .join("---"),
      Param: (isProp, eName, extra, _, eType, __, mName, ___, mType) => {
        if (eType.sourceString.charAt(0) == "(") {
          return `${eType.toModel()}---${eType.toSubModel()}---`;
        } else {
          return "";
        }
      },
    });

    const adapter = sem(match);
    console.log("Greetings, human.");

    const entity = adapter.toEntity();
    const fileNameEntity = entity.split("\n")[0];
    const ent = entity.split("\n").splice(1).join("\n");
    console.log("\nENTITY -", fileNameEntity);
    console.log(ent);

    const model = adapter.toModel();
    const fileNameModel = model.split("\n")[0];
    const mdl = model.split("\n").splice(1).join("\n");
    console.log("MODEL -", fileNameModel);
    console.log(mdl);

    const subE = adapter.toSubEntity();
    const subListE = subE.split("---").filter((v) => v !== "");
    console.log("\nSUBENTITY");
    console.log(subListE);

    const subM = adapter.toSubModel();
    const subListM = subM.split("---").filter((v) => v !== "");
    console.log("\nSUBMODEL");
    console.log(subListM);

    const completeDir = "dist/" + dir + "/";
    if (!fs.existsSync(completeDir)){
        fs.mkdirSync(completeDir);
        fs.mkdirSync(completeDir + "models");
        fs.mkdirSync(completeDir + "entities");
    }

    fs.writeFile(`${completeDir}models/${fileNameModel}`, mdl, () => {});
    fs.writeFile(`${completeDir}entities/${fileNameEntity}`, ent, () => {});
    subListE.forEach((entity) => {
      const fileNameEntity = entity.split("\n")[0];
      const ent = entity.split("\n").splice(1).join("\n");
      fs.writeFile(`${completeDir}entities/${fileNameEntity}`, ent, () => {});
    });
    subListM.forEach((model) => {
      const fileNameModel = model.split("\n")[0];
      const mdl = model.split("\n").splice(1).join("\n");
      fs.writeFile(`${completeDir}models/${fileNameModel}`, mdl, () => {});
    });
  } else {
    console.log("That's not a greeting!");
  }
};

module.exports = { parser };
