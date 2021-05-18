class UserController {
    constructor(formId, tableId) {
        this.formEL = document.getElementById(formId)
        this.tableEl = document.getElementById(tableId)
        this.onSubmit()
    }

    onSubmit() {
        this.formEL.addEventListener("submit", (ev) => {
            ev.preventDefault();
            let btn = document.querySelector('[type=submit]')
            btn.disabled = true

            let values = this.getValues()

            this.getPhoto().then((content) => {
                values.photo = content
                this.addLine(values)
                this.formEL.reset()
                btn.disabled = false
            }, (e) => {
                console.error(e)
            })


        });

    }

    getPhoto() {
        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();
            let elements = [...this.formEL.elements].filter(item => {
                if (item.name === 'photo') {
                    return item;
                }
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (e) => {
                reject(e)
            }

            file ? fileReader.readAsDataURL(file) : resolve('dist/img/boxed-bg.png')
        })

    }

    getValues() {
        let user = {};
        let isValid = true;

        [...this.formEL.elements].forEach((field, index) => {

            if(['name', 'email', 'password'].indexOf(field.name) >-1 && !field.value){
                field.parentElement.classList.add('has-error');
                isValid = false
            }

            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value
                }
            } else if (field.name == 'admin') {
                user[field.name] = field.checked
            } else {
                user[field.name] = field.value
            }
        });

        if (!isValid){
            return false
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        )

    }

    addLine(dataUser) {
        let tr = document.createElement('tr')
        tr.innerHTML = `
                <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${dataUser.name}</td>
                <td>${dataUser.email}</td>
                <td>${dataUser.admin ? 'Sim': 'Não'}</td>
                <td>${Utils.dateFormat(dataUser.register)}</td>
                <td>${dataUser.country}</td>
                <td>
                  <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                  <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                </td>`
        this.tableEl.appendChild(tr)
    }
}