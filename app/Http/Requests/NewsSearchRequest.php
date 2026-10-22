<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q'           => ['nullable', 'string', 'max:255'],
            'country'     => ['nullable', 'string', 'max:10'],
            'category'    => ['nullable', 'string', 'max:50'],
            'datePreset'  => ['nullable', 'string', 'in:all,today,yesterday,last7,last30,specific,custom'],
            'specificDate'=> ['nullable', 'date'],
            'from'        => ['nullable', 'date'],
            'to'          => ['nullable', 'date', 'after_or_equal:from'],
            'weekdays'    => ['nullable', 'array'],
            'weekdays.*'  => ['integer', 'between:0,6'],
            'sortBy'      => ['nullable', 'string', 'in:newest,oldest,publishedAt,relevancy'],
            'page'        => ['nullable', 'integer', 'min:1'],
            'pageSize'    => ['nullable', 'integer', 'between:5,100'],
            'timezone'    => ['nullable', 'string', 'timezone:all'],
        ];
    }

    public function messages(): array
    {
        return [
            'to.after_or_equal' => 'The end date must be a date after or equal to the start date.',
        ];
    }
}
