namespace package {

    export function generate_description(filedata, prefix) {
        let title = filedata.title;
        let version = filedata.version;
        if (prefix) {
            prefix = `${prefix}.`;
        }
        let now = new Date().toISOString().split('T')[0];
        let date = now;
        let description = `\
Package: ${prefix}${title}
Version: ${version}
Date: ${date}
Depends: R (>= 3.1.0)
Description: ${title}
Title: ${title}
LazyData: yes
NeedsCompilation: yes`;
        return description;
    };

    export function create_package(filedata, package_info) {
        let data_filename = package_info.data_filename;
        let description = package_info.description;
        let package_prefix = package_info.prefix || '';
        let gz = zlib.createGzip();
        let archive = archiver('tar', { store: true });
        archive.pipe(gz);
        archive.append(fs.createReadStream(filedata.path), { name: `${filedata.title}/data/${data_filename}.rda` });
        archive.append('', { name: `${filedata.title}/NAMESPACE` });
        archive.append(generate_description(filedata, package_prefix), { name: `${filedata.title}/DESCRIPTION` });
        archive.finalize();
        return gz;
    };
}